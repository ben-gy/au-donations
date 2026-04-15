// Filtering and search logic for the donation dataset.
// Pure functions — fully unit-tested.

import type { Donation, DonorType } from '../data/donations';
import type { PartyCode } from '../data/parties';
import type { Jurisdiction } from '../data/jurisdictions';

export type FilterState = {
  query: string;
  jurisdictions: Set<Jurisdiction['code']>;
  parties: Set<PartyCode>;
  donorTypes: Set<DonorType>;
  fyMin: string | null;
  fyMax: string | null;
  amountMin: number;
  amountMax: number;
};

export function defaultFilterState(): FilterState {
  return {
    query: '',
    jurisdictions: new Set(),
    parties: new Set(),
    donorTypes: new Set(),
    fyMin: null,
    fyMax: null,
    amountMin: 0,
    amountMax: Number.POSITIVE_INFINITY,
  };
}

function normalise(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Case-insensitive substring match that splits the query into whitespace-
 * separated tokens and requires all tokens to match somewhere in the haystack.
 */
export function matchesQuery(donation: Donation, query: string): boolean {
  const q = normalise(query);
  if (!q) return true;
  const haystack = [
    donation.donor,
    donation.recipient,
    donation.donorType,
    donation.category,
    donation.notes ?? '',
  ]
    .map(normalise)
    .join(' ');
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

export function matchesFilters(donation: Donation, filters: FilterState): boolean {
  if (!matchesQuery(donation, filters.query)) return false;
  if (filters.jurisdictions.size > 0 && !filters.jurisdictions.has(donation.jurisdiction)) return false;
  if (filters.parties.size > 0 && !filters.parties.has(donation.recipientParty)) return false;
  if (filters.donorTypes.size > 0 && !filters.donorTypes.has(donation.donorType)) return false;
  if (donation.amount < filters.amountMin) return false;
  if (donation.amount > filters.amountMax) return false;
  if (filters.fyMin && compareFyStrings(donation.fy, filters.fyMin) < 0) return false;
  if (filters.fyMax && compareFyStrings(donation.fy, filters.fyMax) > 0) return false;
  return true;
}

export function filterDonations(donations: Donation[], filters: FilterState): Donation[] {
  return donations.filter((d) => matchesFilters(d, filters));
}

function compareFyStrings(a: string, b: string): number {
  // Local copy of format.ts compareFy to avoid circular imports during tree-shake.
  const parse = (fy: string): number => {
    const m = /^(\d{4})-(\d{2})$/.exec(fy);
    return m ? Number(m[1]) : NaN;
  };
  const aN = parse(a);
  const bN = parse(b);
  if (Number.isNaN(aN) && Number.isNaN(bN)) return 0;
  if (Number.isNaN(aN)) return 1;
  if (Number.isNaN(bN)) return -1;
  return aN - bN;
}

/**
 * Sort donations by a named field and direction.
 */
export type SortField = 'donor' | 'recipient' | 'amount' | 'fy' | 'jurisdiction';
export type SortDir = 'asc' | 'desc';

export function sortDonations(
  donations: Donation[],
  field: SortField,
  dir: SortDir,
): Donation[] {
  const mult = dir === 'asc' ? 1 : -1;
  return [...donations].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'amount':
        cmp = a.amount - b.amount;
        break;
      case 'donor':
        cmp = a.donor.localeCompare(b.donor);
        break;
      case 'recipient':
        cmp = a.recipient.localeCompare(b.recipient);
        break;
      case 'fy':
        cmp = compareFyStrings(a.fy, b.fy);
        break;
      case 'jurisdiction':
        cmp = a.jurisdiction.localeCompare(b.jurisdiction);
        break;
    }
    return cmp * mult;
  });
}
