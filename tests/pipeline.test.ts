// Unit tests for the pure normalization helpers in pipeline/collect.mjs —
// the script that mirrors the AEC Transparency Register bulk export into
// public/data/donations.json.

import { describe, expect, it } from 'vitest';
import {
  parseCsv,
  normalizeFy,
  mapRecipientParty,
  classifyDonorType,
  cleanName,
  normalizeDonations,
} from '../pipeline/collect.mjs';

describe('parseCsv', () => {
  it('parses quoted fields with commas and escaped quotes', () => {
    const rows = parseCsv('"a","b,c","say ""hi"""\n"1","2","3"\n');
    expect(rows).toEqual([
      ['a', 'b,c', 'say "hi"'],
      ['1', '2', '3'],
    ]);
  });
  it('handles embedded newlines inside quotes', () => {
    const rows = parseCsv('"a","line1\nline2"\n"b","c"');
    expect(rows).toEqual([
      ['a', 'line1\nline2'],
      ['b', 'c'],
    ]);
  });
  it('strips a BOM and skips blank lines', () => {
    const rows = parseCsv('﻿"x","y"\n\n"1","2"\n');
    expect(rows).toEqual([
      ['x', 'y'],
      ['1', '2'],
    ]);
  });
});

describe('normalizeFy', () => {
  it('normalizes the AEC long form used pre-2011', () => {
    expect(normalizeFy('1998-1999')).toBe('1998-99');
    expect(normalizeFy('2010-2011')).toBe('2010-11');
  });
  it('passes through the short form', () => {
    expect(normalizeFy('2024-25')).toBe('2024-25');
  });
  it('rejects garbage and inconsistent ranges', () => {
    expect(normalizeFy('2024-27')).toBeNull();
    expect(normalizeFy('not a year')).toBeNull();
    expect(normalizeFy('')).toBeNull();
  });
});

describe('mapRecipientParty', () => {
  const cases: Array<[string, string]> = [
    ['Australian Labor Party (Western Australian Branch)', 'ALP'],
    ['ALP-FED', 'ALP'],
    ['ALP National Secretariat', 'ALP'],
    ['Liberal Party of Australia, NSW Division', 'LIB'],
    ['LIB - WA', 'LIB'],
    ['LP-VIC', 'LIB'],
    ['Country Liberal Party (NT)', 'LIB'],
    ['Liberal National Party of Queensland', 'LNP'],
    ['LNP-QLD', 'LNP'],
    ['National Party of Australia - N.S.W.', 'NAT'],
    ['NAT-FED', 'NAT'],
    ['The Australian Greens', 'GRN'],
    ["Pauline Hanson's One Nation", 'ONP'],
    ['United Australia Party', 'UAP'],
    ['Climate 200 Pty Limited', 'CA'],
    ["Katter's Australian Party", 'KAP'],
    ['Jacqui Lambie Network', 'JLN'],
    ['Shooters, Fishers and Farmers Party', 'SFF'],
    ['Christian Democratic Party (Fred Nile Group)', 'OTH'],
    ['Trumpet of Patriots', 'OTH'],
    ['Advance Australia', 'OTH'],
  ];
  for (const [name, expected] of cases) {
    it(`maps "${name}" → ${expected}`, () => {
      expect(mapRecipientParty(name)).toBe(expected);
    });
  }
});

describe('classifyDonorType', () => {
  const cases: Array<[string, string]> = [
    ['Mineralogy Pty Ltd', 'Corporation'],
    ['Origin Energy', 'Corporation'],
    ['Australian Gypsum Industries', 'Corporation'],
    ['Members Australia Credit Union', 'Corporation'],
    ['CFMEU', 'Union'],
    ['CFMMEU - Mining & Energy Division', 'Union'],
    ['United Workers Union', 'Union'],
    ['Cormack Foundation Pty Ltd', 'Foundation'],
    ['The Pharmacy Guild of Australia', 'Industry body'],
    ['Minerals Council of Australia', 'Industry body'],
    ['Clubs Queensland', 'Industry body'],
    ['Climate 200 Pty Limited', 'Third party'],
    ['Wall, Pamela', 'Individual'],
    ['Pauline Hanson', 'Individual'],
  ];
  for (const [name, expected] of cases) {
    it(`classifies "${name}" → ${expected}`, () => {
      expect(classifyDonorType(name)).toBe(expected);
    });
  }
});

describe('cleanName', () => {
  it('collapses the stray padding AEC names carry', () => {
    expect(cleanName('          Combined Skills   Training Association ')).toBe(
      'Combined Skills Training Association',
    );
  });
});

describe('normalizeDonations', () => {
  const header = ['Financial Year', 'Donor Name', 'Donation Made To', 'Date', 'Value'];
  it('aggregates payments per (fy, donor, recipient) and skips bad rows', () => {
    const rows = [
      header,
      ['2024-25', ' Acme Pty Ltd', 'Liberal Party of Australia', '01/07/2024', '1000'],
      ['2024-25', 'Acme Pty Ltd ', 'Liberal Party of Australia', '01/08/2024', '2500'],
      ['2024-25', 'Acme Pty Ltd', 'Australian Labor Party (ALP)', '01/08/2024', '400'],
      ['2024-25', '', 'Liberal Party of Australia', '01/08/2024', '100'], // no donor
      ['2024-25', 'Acme Pty Ltd', 'Liberal Party of Australia', '01/09/2024', '-50'], // negative
      ['garbage', 'Acme Pty Ltd', 'Liberal Party of Australia', '01/09/2024', '10'], // bad FY
    ];
    const { donations, skipped } = normalizeDonations(rows, 10);
    expect(skipped).toBe(3);
    expect(donations).toHaveLength(2);
    const lib = donations.find((d) => d.recipientParty === 'LIB');
    expect(lib?.amount).toBe(3500);
    expect(lib?.donor).toBe('Acme Pty Ltd');
    expect(lib?.jurisdiction).toBe('CTH');
  });
  it('keeps only the most recent fyWindow financial years', () => {
    const rows = [
      header,
      ['2020-21', 'A Pty Ltd', 'Liberal Party', '', '100'],
      ['2021-22', 'A Pty Ltd', 'Liberal Party', '', '100'],
      ['2022-23', 'A Pty Ltd', 'Liberal Party', '', '100'],
    ];
    const { donations, keptFys } = normalizeDonations(rows, 2);
    expect(keptFys).toEqual(['2021-22', '2022-23']);
    expect(donations).toHaveLength(2);
  });
  it('throws when the schema changes', () => {
    expect(() => normalizeDonations([['Year', 'Who', 'To', 'When', 'HowMuch']])).toThrow(/schema/i);
  });
});
