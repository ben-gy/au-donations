import { describe, expect, it } from 'vitest';
import {
  topDonors,
  topRecipients,
  totalsByParty,
  totalsByYear,
  grandTotal,
  uniqueDonorCount,
} from '../src/utils/aggregate';
import type { Donation } from '../src/data/donations';

const sample: Donation[] = [
  {
    id: 'a1',
    donor: 'Pratt Holdings',
    donorType: 'Corporation',
    recipient: 'Liberal Party',
    recipientParty: 'LIB',
    jurisdiction: 'CTH',
    amount: 500000,
    fy: '2022-23',
    category: 'Cash',
  },
  {
    id: 'a2',
    donor: 'Pratt Holdings',
    donorType: 'Corporation',
    recipient: 'Labor Party',
    recipientParty: 'ALP',
    jurisdiction: 'CTH',
    amount: 400000,
    fy: '2022-23',
    category: 'Cash',
  },
  {
    id: 'a3',
    donor: 'CFMEU',
    donorType: 'Union',
    recipient: 'Labor Party',
    recipientParty: 'ALP',
    jurisdiction: 'CTH',
    amount: 1_200_000,
    fy: '2022-23',
    category: 'Cash',
  },
  {
    id: 'a4',
    donor: 'Mineralogy',
    donorType: 'Corporation',
    recipient: 'United Australia Party',
    recipientParty: 'UAP',
    jurisdiction: 'CTH',
    amount: 83_600_000,
    fy: '2021-22',
    category: 'Cash',
  },
  {
    id: 'a5',
    donor: 'Cormack Foundation',
    donorType: 'Associated entity',
    recipient: 'Liberal Party',
    recipientParty: 'LIB',
    jurisdiction: 'CTH',
    amount: 2_850_000,
    fy: '2022-23',
    category: 'Cash',
  },
];

describe('topDonors', () => {
  it('aggregates by donor and sorts descending', () => {
    const result = topDonors(sample);
    expect(result[0].name).toBe('Mineralogy');
    expect(result[0].total).toBe(83_600_000);
    const pratt = result.find((r) => r.name === 'Pratt Holdings');
    expect(pratt?.total).toBe(900000);
    expect(pratt?.count).toBe(2);
  });
  it('records per-party breakdown', () => {
    const result = topDonors(sample);
    const pratt = result.find((r) => r.name === 'Pratt Holdings');
    expect(pratt?.byParty.LIB).toBe(500000);
    expect(pratt?.byParty.ALP).toBe(400000);
  });
  it('respects the limit', () => {
    const result = topDonors(sample, 2);
    expect(result).toHaveLength(2);
  });
  it('returns empty array for empty input', () => {
    expect(topDonors([])).toEqual([]);
  });
});

describe('topRecipients', () => {
  it('aggregates by recipient and sorts descending', () => {
    const result = topRecipients(sample);
    expect(result[0].name).toBe('United Australia Party');
    const labor = result.find((r) => r.name === 'Labor Party');
    expect(labor?.total).toBe(1_600_000);
    expect(labor?.count).toBe(2);
  });
});

describe('totalsByParty', () => {
  it('sums amounts by party code', () => {
    const result = totalsByParty(sample);
    const uap = result.find((r) => r.party === 'UAP');
    const lib = result.find((r) => r.party === 'LIB');
    const alp = result.find((r) => r.party === 'ALP');
    expect(uap?.total).toBe(83_600_000);
    expect(lib?.total).toBe(3_350_000);
    expect(alp?.total).toBe(1_600_000);
  });
  it('sorts descending by total', () => {
    const result = totalsByParty(sample);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].total).toBeGreaterThanOrEqual(result[i].total);
    }
  });
});

describe('totalsByYear', () => {
  it('groups by fy and sorts chronologically', () => {
    const result = totalsByYear(sample);
    expect(result[0].fy).toBe('2021-22');
    expect(result[0].total).toBe(83_600_000);
    expect(result[1].fy).toBe('2022-23');
    expect(result[1].total).toBe(4_950_000);
  });
  it('splits totals by recipient party', () => {
    const result = totalsByYear(sample);
    const fy2223 = result.find((r) => r.fy === '2022-23');
    expect(fy2223?.byParty.LIB).toBe(3_350_000);
    expect(fy2223?.byParty.ALP).toBe(1_600_000);
  });
});

describe('grandTotal', () => {
  it('sums all amounts', () => {
    expect(grandTotal(sample)).toBe(88_550_000);
  });
  it('returns 0 for empty input', () => {
    expect(grandTotal([])).toBe(0);
  });
});

describe('uniqueDonorCount', () => {
  it('counts distinct donor names', () => {
    expect(uniqueDonorCount(sample)).toBe(4);
  });
  it('returns 0 for empty input', () => {
    expect(uniqueDonorCount([])).toBe(0);
  });
});
