import { describe, expect, it } from 'vitest';
import {
  defaultFilterState,
  filterDonations,
  matchesQuery,
  matchesFilters,
  sortDonations,
} from '../src/utils/filter';
import type { Donation } from '../src/data/donations';

const sample: Donation[] = [
  {
    id: 't1',
    donor: 'Pratt Holdings Pty Ltd',
    donorType: 'Corporation',
    recipient: 'Liberal Party (Federal)',
    recipientParty: 'LIB',
    jurisdiction: 'CTH',
    amount: 500000,
    fy: '2022-23',
    category: 'Cash',
  },
  {
    id: 't2',
    donor: 'CFMEU',
    donorType: 'Union',
    recipient: 'Australian Labor Party',
    recipientParty: 'ALP',
    jurisdiction: 'CTH',
    amount: 1_200_000,
    fy: '2022-23',
    category: 'Cash',
  },
  {
    id: 't3',
    donor: 'Mineralogy Pty Ltd',
    donorType: 'Corporation',
    recipient: 'United Australia Party',
    recipientParty: 'UAP',
    jurisdiction: 'CTH',
    amount: 83_600_000,
    fy: '2021-22',
    category: 'Cash',
    notes: 'Single largest political donation in Australian history',
  },
  {
    id: 't4',
    donor: 'Lindsay Fox',
    donorType: 'Individual',
    recipient: 'Liberal Party (Victoria)',
    recipientParty: 'LIB',
    jurisdiction: 'VIC',
    amount: 4670,
    fy: '2023-24',
    category: 'Cash',
  },
  {
    id: 't5',
    donor: 'Clubs NSW',
    donorType: 'Industry body',
    recipient: 'Australian Labor Party (NSW)',
    recipientParty: 'ALP',
    jurisdiction: 'NSW',
    amount: 220_000,
    fy: '2022-23',
    category: 'Cash',
  },
];

describe('matchesQuery', () => {
  it('empty query matches everything', () => {
    expect(matchesQuery(sample[0], '')).toBe(true);
    expect(matchesQuery(sample[0], '   ')).toBe(true);
  });
  it('case-insensitive donor match', () => {
    expect(matchesQuery(sample[0], 'pratt')).toBe(true);
    expect(matchesQuery(sample[0], 'PRATT')).toBe(true);
  });
  it('recipient field match', () => {
    expect(matchesQuery(sample[1], 'labor')).toBe(true);
  });
  it('donor type match', () => {
    expect(matchesQuery(sample[1], 'union')).toBe(true);
  });
  it('notes field match', () => {
    expect(matchesQuery(sample[2], 'historic')).toBe(false);
    expect(matchesQuery(sample[2], 'largest')).toBe(true);
  });
  it('multi-token AND match', () => {
    expect(matchesQuery(sample[2], 'mineralogy united')).toBe(true);
    expect(matchesQuery(sample[2], 'mineralogy labor')).toBe(false);
  });
});

describe('matchesFilters', () => {
  it('default filters match everything', () => {
    const filters = defaultFilterState();
    for (const d of sample) expect(matchesFilters(d, filters)).toBe(true);
  });
  it('jurisdiction filter', () => {
    const filters = defaultFilterState();
    filters.jurisdictions.add('VIC');
    expect(matchesFilters(sample[0], filters)).toBe(false);
    expect(matchesFilters(sample[3], filters)).toBe(true);
  });
  it('party filter', () => {
    const filters = defaultFilterState();
    filters.parties.add('UAP');
    expect(matchesFilters(sample[0], filters)).toBe(false);
    expect(matchesFilters(sample[2], filters)).toBe(true);
  });
  it('donor type filter', () => {
    const filters = defaultFilterState();
    filters.donorTypes.add('Union');
    expect(matchesFilters(sample[0], filters)).toBe(false);
    expect(matchesFilters(sample[1], filters)).toBe(true);
  });
  it('amount range filter', () => {
    const filters = defaultFilterState();
    filters.amountMin = 1_000_000;
    expect(matchesFilters(sample[0], filters)).toBe(false);
    expect(matchesFilters(sample[1], filters)).toBe(true);
    expect(matchesFilters(sample[2], filters)).toBe(true);
  });
  it('fy range filter', () => {
    const filters = defaultFilterState();
    filters.fyMin = '2023-24';
    expect(matchesFilters(sample[0], filters)).toBe(false);
    expect(matchesFilters(sample[3], filters)).toBe(true);
  });
});

describe('filterDonations', () => {
  it('filters by query', () => {
    const filters = defaultFilterState();
    filters.query = 'pratt';
    expect(filterDonations(sample, filters)).toHaveLength(1);
  });
  it('combines facets', () => {
    const filters = defaultFilterState();
    filters.jurisdictions.add('CTH');
    filters.donorTypes.add('Corporation');
    const result = filterDonations(sample, filters);
    expect(result.map((d) => d.id).sort()).toEqual(['t1', 't3']);
  });
  it('returns empty array when nothing matches', () => {
    const filters = defaultFilterState();
    filters.query = 'nonexistent donor xyz';
    expect(filterDonations(sample, filters)).toHaveLength(0);
  });
});

describe('sortDonations', () => {
  it('sorts by amount ascending', () => {
    const sorted = sortDonations(sample, 'amount', 'asc');
    expect(sorted[0].id).toBe('t4');
    expect(sorted[sorted.length - 1].id).toBe('t3');
  });
  it('sorts by amount descending', () => {
    const sorted = sortDonations(sample, 'amount', 'desc');
    expect(sorted[0].id).toBe('t3');
  });
  it('sorts by donor alphabetically', () => {
    const sorted = sortDonations(sample, 'donor', 'asc');
    expect(sorted[0].donor).toBe('CFMEU');
  });
  it('sorts by fy', () => {
    const sorted = sortDonations(sample, 'fy', 'asc');
    expect(sorted[0].fy).toBe('2021-22');
    expect(sorted[sorted.length - 1].fy).toBe('2023-24');
  });
  it('does not mutate input', () => {
    const input = [...sample];
    sortDonations(input, 'amount', 'desc');
    expect(input).toEqual(sample);
  });
});
