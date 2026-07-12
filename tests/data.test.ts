import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STATE_DONATIONS, STATE_DONATIONS_FILTERED } from '../src/data/donations';
import { JURISDICTIONS, JURISDICTION_BY_CODE } from '../src/data/jurisdictions';
import { PARTIES } from '../src/data/parties';
import { GLOSSARY } from '../src/data/glossary';

describe('state donations snapshot integrity', () => {
  it('has a meaningful number of records', () => {
    expect(STATE_DONATIONS.length).toBeGreaterThan(50);
  });
  it('contains no federal records — those come from the pipeline', () => {
    for (const d of STATE_DONATIONS) expect(d.jurisdiction).not.toBe('CTH');
  });
  it('filters out zero-amount placeholders', () => {
    for (const d of STATE_DONATIONS_FILTERED) expect(d.amount).toBeGreaterThan(0);
  });
  it('every donation has a valid jurisdiction code', () => {
    for (const d of STATE_DONATIONS_FILTERED) {
      expect(JURISDICTION_BY_CODE[d.jurisdiction]).toBeDefined();
    }
  });
  it('every donation has a known party code', () => {
    for (const d of STATE_DONATIONS_FILTERED) {
      expect(PARTIES[d.recipientParty]).toBeDefined();
    }
  });
  it('every donation has a well-formed financial year', () => {
    for (const d of STATE_DONATIONS_FILTERED) {
      expect(d.fy).toMatch(/^\d{4}-\d{2}$/);
    }
  });
  it('every donation has non-empty donor and recipient fields', () => {
    for (const d of STATE_DONATIONS_FILTERED) {
      expect(d.donor.length).toBeGreaterThan(0);
      expect(d.recipient.length).toBeGreaterThan(0);
    }
  });
  it('donation ids are unique', () => {
    const ids = new Set<string>();
    for (const d of STATE_DONATIONS) {
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);
    }
  });
});

describe('published federal dataset (public/data/donations.json)', () => {
  type FederalPayload = {
    meta: { recordCount: number; financialYears: string[]; totalAmount: number };
    donations: Array<{
      donor: string;
      recipient: string;
      recipientParty: string;
      jurisdiction: string;
      amount: number;
      fy: string;
    }>;
  };
  const payload: FederalPayload = JSON.parse(
    readFileSync(join(__dirname, '..', 'public', 'data', 'donations.json'), 'utf8'),
  );

  it('carries a substantial record count that matches meta', () => {
    expect(payload.donations.length).toBeGreaterThan(4000);
    expect(payload.meta.recordCount).toBe(payload.donations.length);
  });
  it('covers a multi-year window', () => {
    expect(payload.meta.financialYears.length).toBeGreaterThanOrEqual(8);
  });
  it('every record is a well-formed CTH donation', () => {
    for (const d of payload.donations) {
      expect(d.jurisdiction).toBe('CTH');
      expect(d.donor.length).toBeGreaterThan(0);
      expect(d.recipient.length).toBeGreaterThan(0);
      expect(d.amount).toBeGreaterThan(0);
      expect(d.fy).toMatch(/^\d{4}-\d{2}$/);
      expect(PARTIES[d.recipientParty as keyof typeof PARTIES]).toBeDefined();
    }
  });
});

describe('jurisdictions dataset integrity', () => {
  it('has all 9 Australian jurisdictions', () => {
    expect(JURISDICTIONS).toHaveLength(9);
  });
  it('every jurisdiction has a regulator URL', () => {
    for (const j of JURISDICTIONS) {
      expect(j.regulatorUrl).toMatch(/^https?:\/\//);
    }
  });
  it('every jurisdiction has a positive disclosure threshold', () => {
    for (const j of JURISDICTIONS) {
      expect(j.disclosureThreshold).toBeGreaterThan(0);
    }
  });
});

describe('glossary dataset integrity', () => {
  it('every entry has a term, short, and long definition', () => {
    for (const key of Object.keys(GLOSSARY)) {
      const entry = GLOSSARY[key];
      expect(entry.term.length).toBeGreaterThan(0);
      expect(entry.short.length).toBeGreaterThan(0);
      expect(entry.long.length).toBeGreaterThan(0);
    }
  });
});
