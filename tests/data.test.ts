import { describe, expect, it } from 'vitest';
import { DONATIONS, DONATIONS_FILTERED } from '../src/data/donations';
import { JURISDICTIONS, JURISDICTION_BY_CODE } from '../src/data/jurisdictions';
import { PARTIES } from '../src/data/parties';
import { GLOSSARY } from '../src/data/glossary';

describe('donations dataset integrity', () => {
  it('has a meaningful number of records', () => {
    expect(DONATIONS.length).toBeGreaterThan(200);
  });
  it('filters out zero-amount placeholders', () => {
    for (const d of DONATIONS_FILTERED) expect(d.amount).toBeGreaterThan(0);
  });
  it('every donation has a valid jurisdiction code', () => {
    for (const d of DONATIONS_FILTERED) {
      expect(JURISDICTION_BY_CODE[d.jurisdiction]).toBeDefined();
    }
  });
  it('every donation has a known party code', () => {
    for (const d of DONATIONS_FILTERED) {
      expect(PARTIES[d.recipientParty]).toBeDefined();
    }
  });
  it('every donation has a well-formed financial year', () => {
    for (const d of DONATIONS_FILTERED) {
      expect(d.fy).toMatch(/^\d{4}-\d{2}$/);
    }
  });
  it('every donation has non-empty donor and recipient fields', () => {
    for (const d of DONATIONS_FILTERED) {
      expect(d.donor.length).toBeGreaterThan(0);
      expect(d.recipient.length).toBeGreaterThan(0);
    }
  });
  it('donation ids are unique', () => {
    const ids = new Set<string>();
    for (const d of DONATIONS) {
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);
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
