// Aggregation helpers — compute top donors, top recipients, totals by party,
// totals by year, etc. Pure functions.

import type { Donation } from '../data/donations';
import type { PartyCode } from '../data/parties';

export type TopEntry = {
  name: string;
  total: number;
  count: number;
  /** Breakdown by recipient party. */
  byParty: Partial<Record<PartyCode, number>>;
};

export function topDonors(donations: Donation[], limit: number = 15): TopEntry[] {
  const map = new Map<string, TopEntry>();
  for (const d of donations) {
    const existing = map.get(d.donor);
    if (existing) {
      existing.total += d.amount;
      existing.count += 1;
      existing.byParty[d.recipientParty] = (existing.byParty[d.recipientParty] ?? 0) + d.amount;
    } else {
      map.set(d.donor, {
        name: d.donor,
        total: d.amount,
        count: 1,
        byParty: { [d.recipientParty]: d.amount } as Partial<Record<PartyCode, number>>,
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function topRecipients(donations: Donation[], limit: number = 15): TopEntry[] {
  const map = new Map<string, TopEntry>();
  for (const d of donations) {
    const existing = map.get(d.recipient);
    if (existing) {
      existing.total += d.amount;
      existing.count += 1;
      existing.byParty[d.recipientParty] = (existing.byParty[d.recipientParty] ?? 0) + d.amount;
    } else {
      map.set(d.recipient, {
        name: d.recipient,
        total: d.amount,
        count: 1,
        byParty: { [d.recipientParty]: d.amount } as Partial<Record<PartyCode, number>>,
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export type PartyTotal = {
  party: PartyCode;
  total: number;
  count: number;
};

export function totalsByParty(donations: Donation[]): PartyTotal[] {
  const map = new Map<PartyCode, PartyTotal>();
  for (const d of donations) {
    const existing = map.get(d.recipientParty);
    if (existing) {
      existing.total += d.amount;
      existing.count += 1;
    } else {
      map.set(d.recipientParty, { party: d.recipientParty, total: d.amount, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export type YearTotal = {
  fy: string;
  total: number;
  count: number;
  byParty: Partial<Record<PartyCode, number>>;
};

export function totalsByYear(donations: Donation[]): YearTotal[] {
  const map = new Map<string, YearTotal>();
  for (const d of donations) {
    const existing = map.get(d.fy);
    if (existing) {
      existing.total += d.amount;
      existing.count += 1;
      existing.byParty[d.recipientParty] = (existing.byParty[d.recipientParty] ?? 0) + d.amount;
    } else {
      map.set(d.fy, {
        fy: d.fy,
        total: d.amount,
        count: 1,
        byParty: { [d.recipientParty]: d.amount } as Partial<Record<PartyCode, number>>,
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    const parse = (fy: string): number => {
      const m = /^(\d{4})-(\d{2})$/.exec(fy);
      return m ? Number(m[1]) : 0;
    };
    return parse(a.fy) - parse(b.fy);
  });
}

export function grandTotal(donations: Donation[]): number {
  return donations.reduce((sum, d) => sum + d.amount, 0);
}

export function uniqueDonorCount(donations: Donation[]): number {
  const set = new Set<string>();
  for (const d of donations) set.add(d.donor);
  return set.size;
}
