#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// Data pipeline: AEC Transparency Register → public/data/donations.json
//
// Downloads the AEC's bulk annual-returns export (a zip of CSVs, no auth,
// no CORS restrictions) and normalizes the "Donations Made" dataset —
// donations reported by donors in their federal annual returns — into the
// site's Donation shape.
//
// Why "Donations Made" (donor returns) rather than "Detailed Receipts"
// (recipient returns): donor returns itemize actual donations (~66k rows
// back to 1998-99), whereas parties bucket most income as undifferentiated
// "Other Receipt" — only ~25k rows are explicitly tagged "Donation
// Received". Using a single side also avoids double-counting the same gift
// reported by both donor and recipient.
//
// Normalization:
//   - financial years like "1998-1999" / "2011-12" → "1998-99" / "2011-12"
//   - individual dated payments aggregated per (FY, donor, recipient)
//   - recipient name → party code via keyword mapping (site's PartyCode set)
//   - donor type inferred from the donor name (the register has no type field)
//   - scope limited to the most recent FY_WINDOW financial years to keep the
//     payload browser-friendly (~8k records ≈ 1.5 MB raw, ~200 KB gzipped)
//
// State/territory registers are NOT collected here — they have no comparable
// bulk exports, so the site keeps its hand-curated state snapshot as a
// static supplement (see src/data/donations.ts).
//
// Guards: refuses to (over)write public/data/donations.json unless the
// normalized output passes sanity floors (record count, FY coverage,
// grand total). A failed run leaves any existing file untouched.
//
// Usage: node pipeline/collect.mjs [--from-zip path/to/AllAnnualData.zip]

import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = join(ROOT, 'public', 'data', 'donations.json');

export const SOURCE_URL = 'https://transparency.aec.gov.au/Download/AllAnnualData';
const CSV_NAME = 'Donations Made.csv';

/** How many most-recent financial years to publish. */
const FY_WINDOW = 10;

// Sanity floors — a healthy 10-FY window currently yields ~8,000 aggregated
// records, ≥10 distinct FYs and hundreds of millions of dollars. Falling
// below these means the export shrank or the schema moved; abort rather
// than publish a gutted dataset.
const MIN_RECORDS = 4000;
const MIN_FYS = 8;
const MIN_TOTAL_AUD = 100_000_000;

// ---------------------------------------------------------------------------
// Minimal zip reader (central directory + deflate) — keeps the pipeline
// dependency-free. Handles the two compression methods AEC actually uses.
// ---------------------------------------------------------------------------

export function extractZipEntry(zipBuf, wantedName) {
  // Locate End Of Central Directory record (signature 0x06054b50), scanning
  // backwards past any trailing zip comment.
  let eocd = -1;
  for (let i = zipBuf.length - 22; i >= Math.max(0, zipBuf.length - 22 - 65535); i--) {
    if (zipBuf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a zip file: end-of-central-directory not found');

  const entryCount = zipBuf.readUInt16LE(eocd + 10);
  let offset = zipBuf.readUInt32LE(eocd + 16);

  for (let n = 0; n < entryCount; n++) {
    if (zipBuf.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error('Corrupt zip: bad central-directory entry signature');
    }
    const method = zipBuf.readUInt16LE(offset + 10);
    const compressedSize = zipBuf.readUInt32LE(offset + 20);
    const nameLen = zipBuf.readUInt16LE(offset + 28);
    const extraLen = zipBuf.readUInt16LE(offset + 30);
    const commentLen = zipBuf.readUInt16LE(offset + 32);
    const localOffset = zipBuf.readUInt32LE(offset + 42);
    const name = zipBuf.toString('utf8', offset + 46, offset + 46 + nameLen);

    if (name === wantedName) {
      // Local header repeats name/extra lengths (extra field can differ).
      const localNameLen = zipBuf.readUInt16LE(localOffset + 26);
      const localExtraLen = zipBuf.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const data = zipBuf.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      throw new Error(`Unsupported zip compression method ${method} for ${name}`);
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`Zip entry not found: ${wantedName}`);
}

// ---------------------------------------------------------------------------
// RFC 4180 CSV parser (quoted fields, escaped quotes, embedded newlines).
// ---------------------------------------------------------------------------

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Normalization helpers (exported for tests)
// ---------------------------------------------------------------------------

/** "1998-1999" | "2011-12" → "1998-99" | "2011-12"; null if unparseable. */
export function normalizeFy(raw) {
  const m = /^(\d{4})\s*-\s*(\d{2,4})$/.exec(String(raw).trim());
  if (!m) return null;
  const start = Number(m[1]);
  const end = Number(m[2].slice(-2));
  if (end !== (start + 1) % 100) return null;
  return `${m[1]}-${m[2].slice(-2)}`;
}

/**
 * Map an AEC recipient name onto the site's PartyCode set. Donor returns
 * use both full names ("Liberal Party of Australia, NSW Division") and
 * ad-hoc abbreviations ("LIB-FED", "LP-VIC", "ALP National Secretariat").
 */
export function mapRecipientParty(name) {
  const n = name.toLowerCase();
  if (n.includes('liberal national party') || /\blnp\b/.test(n)) return 'LNP';
  if (n.includes('democratic labour') || n.includes('christian democratic')) return 'OTH';
  if (n.includes('labor') || n.includes('labour') || /\balp\b/.test(n)) return 'ALP';
  // "LIB-FED", "LIB - WA", "LP-VIC" style abbreviations, plus full names.
  // Includes Country Liberal Party (NT), matching the curated dataset.
  if (n.includes('liberal') || /\blib\b/.test(n) || /\blp\s*-/.test(n)) return 'LIB';
  if (n.includes('national party') || /\bnationals\b/.test(n) || /\bnat\s*-/.test(n)) return 'NAT';
  if (n.includes('green')) return 'GRN';
  if (n.includes('one nation')) return 'ONP';
  if (n.includes('united australia') || n.includes('palmer united')) return 'UAP';
  if (n.includes('climate 200')) return 'CA';
  if (n.includes('katter')) return 'KAP';
  if (n.includes('lambie') || /\bjln\b/.test(n)) return 'JLN';
  if (n.includes('shooters')) return 'SFF';
  if (n.includes('independent')) return 'IND';
  return 'OTH';
}

/**
 * Infer a DonorType from a donor name. The AEC donor-return export carries
 * no type field, so this is a heuristic — documented as such in the About
 * modal. Order matters ("Credit Union" is a corporation, "Workers Union"
 * is not).
 */
export function classifyDonorType(name) {
  const n = name.toLowerCase();
  if (/credit union/.test(n)) return 'Corporation';
  if (/\bunion\b|cfmm?eu|cepu|\bactu\b|\bamwu\b|\bawu\b|\bhsu\b|\bsda\b|\btwu\b/.test(n)) return 'Union';
  if (/foundation/.test(n)) return 'Foundation';
  if (/climate 200|advance aus|getup/.test(n)) return 'Third party';
  if (/association|council|guild|chamber of|federation|institute|\bsociety\b|\bclubs\b/.test(n)) return 'Industry body';
  if (CORP_KEYWORDS.test(n)) return 'Corporation';
  // "SURNAME, First" or plain two/three-word personal names.
  if (/^[^,]+,\s*\S+/.test(name)) return 'Individual';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2 && words.length <= 3 && words.every((w) => /^[A-Za-z''.-]+$/.test(w))) {
    return 'Individual';
  }
  return 'Corporation';
}

// Names containing these read as businesses even without a Pty/Ltd suffix
// (e.g. "Australian Gypsum Industries", "Origin Energy").
const CORP_KEYWORDS = new RegExp(
  [
    'pty', '\\bltd\\b', 'limited', '\\binc\\b', 'incorporated', 'corporation', 'holdings',
    '\\bgroup\\b', '\\bbank\\b', 'capital', 'investments', '\\bfund\\b', '\\btrust\\b',
    '\\bsuper\\b', '\\bco\\b\\.?$', 'company', 'enterprises', 'australia\\b', 'services',
    'energy', 'mining', 'industries', 'producers', 'resources', 'petroleum', 'electric',
    '\\bmedia\\b', 'farms', 'motors', 'hotels?\\b', 'wines', 'foods', 'pharma',
    'construction', 'development', 'engineering', 'consulting', 'partners', 'advisory',
    'lawyers', '\\blegal\\b', 'estate', 'agency', 'international', 'pacific', 'global',
    'airlines', 'racing', 'brewing',
  ].join('|'),
);

/** Collapse runs of whitespace and trim. AEC names carry stray padding. */
export function cleanName(raw) {
  return String(raw).replace(/\s+/g, ' ').trim();
}

/**
 * Normalize parsed CSV rows (header + data) into aggregated Donation
 * records for the most recent `fyWindow` financial years.
 */
export function normalizeDonations(rows, fyWindow = FY_WINDOW) {
  const header = rows[0].map((h) => h.trim());
  const col = (label) => {
    const i = header.indexOf(label);
    if (i < 0) throw new Error(`Column "${label}" missing from ${CSV_NAME} — schema changed? Header: ${header.join(', ')}`);
    return i;
  };
  const iFy = col('Financial Year');
  const iDonor = col('Donor Name');
  const iRecipient = col('Donation Made To');
  const iValue = col('Value');

  // First pass: collect valid rows and the FY range present.
  const valid = [];
  const fySet = new Set();
  let skipped = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const fy = normalizeFy(row[iFy]);
    const donor = cleanName(row[iDonor]);
    const recipient = cleanName(row[iRecipient]);
    const amount = Number(String(row[iValue]).replace(/[,$\s]/g, ''));
    if (!fy || !donor || !recipient || !Number.isFinite(amount) || amount <= 0) {
      skipped++;
      continue;
    }
    fySet.add(fy);
    valid.push({ fy, donor, recipient, amount });
  }

  const fysSorted = [...fySet].sort(); // "YYYY-YY" sorts chronologically
  const keptFys = new Set(fysSorted.slice(-fyWindow));

  // Second pass: aggregate per (fy, donor, recipient).
  const agg = new Map();
  for (const v of valid) {
    if (!keptFys.has(v.fy)) continue;
    const key = `${v.fy} ${v.donor} ${v.recipient}`;
    const e = agg.get(key);
    if (e) e.amount += v.amount;
    else agg.set(key, { ...v });
  }

  const records = [...agg.values()].sort(
    (a, b) => a.fy.localeCompare(b.fy) || b.amount - a.amount || a.donor.localeCompare(b.donor) || a.recipient.localeCompare(b.recipient),
  );

  const donations = records.map((r, i) => ({
    id: `aec-${r.fy}-${i}`,
    donor: r.donor,
    donorType: classifyDonorType(r.donor),
    recipient: r.recipient,
    recipientParty: mapRecipientParty(r.recipient),
    jurisdiction: 'CTH',
    amount: Math.round(r.amount),
    fy: r.fy,
    category: 'Cash',
  }));

  return { donations, keptFys: [...keptFys].sort(), skipped, rawRows: rows.length - 1 };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const fromZipArg = process.argv.indexOf('--from-zip');
  let zipBuf;
  if (fromZipArg >= 0) {
    const p = process.argv[fromZipArg + 1];
    console.log(`Reading local zip: ${p}`);
    zipBuf = readFileSync(p);
  } else {
    console.log(`Downloading ${SOURCE_URL} …`);
    const res = await fetch(SOURCE_URL, { redirect: 'follow' });
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    zipBuf = Buffer.from(await res.arrayBuffer());
    console.log(`Downloaded ${(zipBuf.length / 1e6).toFixed(1)} MB`);
  }

  const csvText = extractZipEntry(zipBuf, CSV_NAME).toString('utf8');
  const rows = parseCsv(csvText);
  console.log(`Parsed ${rows.length - 1} data rows from "${CSV_NAME}"`);

  const { donations, keptFys, skipped, rawRows } = normalizeDonations(rows);
  const totalAmount = donations.reduce((s, d) => s + d.amount, 0);

  console.log(`Normalized: ${donations.length} aggregated records across FYs ${keptFys[0]}…${keptFys[keptFys.length - 1]} (${skipped} raw rows skipped)`);
  console.log(`Grand total: $${(totalAmount / 1e6).toFixed(1)}M`);

  // Empty/degenerate-write guard: never publish a shrunken dataset.
  if (donations.length < MIN_RECORDS) {
    throw new Error(`Guard: only ${donations.length} records (< ${MIN_RECORDS}) — refusing to write`);
  }
  if (keptFys.length < MIN_FYS) {
    throw new Error(`Guard: only ${keptFys.length} financial years (< ${MIN_FYS}) — refusing to write`);
  }
  if (totalAmount < MIN_TOTAL_AUD) {
    throw new Error(`Guard: grand total $${totalAmount} (< $${MIN_TOTAL_AUD}) — refusing to write`);
  }

  // Keep generatedAt stable when the donations content is unchanged, so a
  // re-run produces a byte-identical file and the workflow's "did anything
  // change?" git-diff guard can skip a no-op commit.
  let generatedAt = new Date().toISOString();
  try {
    const existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
    if (JSON.stringify(existing.donations) === JSON.stringify(donations) && existing.meta?.generatedAt) {
      generatedAt = existing.meta.generatedAt;
      console.log('Dataset unchanged since last run — keeping previous generatedAt.');
    }
  } catch {
    // No existing file (first run) — fresh timestamp.
  }

  const payload = {
    meta: {
      source: 'AEC Transparency Register — annual donor returns ("Donations Made")',
      sourceUrl: SOURCE_URL,
      generatedAt,
      financialYears: keptFys,
      recordCount: donations.length,
      rawRowCount: rawRows,
      totalAmount,
      notes: 'Individual dated payments are aggregated per financial year, donor, and recipient. Donor types are inferred from names. Jurisdiction is Commonwealth (CTH) throughout.',
    },
    donations,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  // Write via temp file + rename so a crash mid-write can't truncate the
  // published dataset.
  const tmp = `${OUTPUT_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(payload));
  renameSync(tmp, OUTPUT_PATH);
  console.log(`Wrote ${OUTPUT_PATH} (${(JSON.stringify(payload).length / 1e6).toFixed(2)} MB)`);
}

// Only run when executed directly (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(`\ncollect.mjs failed: ${err.message}`);
    process.exit(1);
  });
}
