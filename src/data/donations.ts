// State & territory register supplement — a curated snapshot of donations
// drawn from the eight state/territory disclosure registers (NSW, VIC, QLD,
// WA, SA, TAS, ACT, NT).
//
// Unlike the federal AEC Transparency Register — which publishes a bulk CSV
// export that this site mirrors automatically each year (see
// pipeline/collect.mjs and public/data/donations.json) — the state registers
// expose no comparable machine-readable bulk downloads, so they cannot be
// mirrored. These records are an illustrative, hand-curated sample for
// exploration: not exhaustive, not live. Amounts reflect publicly reported
// figures with light rounding. The About modal explains methodology and
// links to the authoritative registers.

import type { PartyCode } from './parties';
import type { Jurisdiction } from './jurisdictions';

export type DonorType =
  | 'Individual'
  | 'Corporation'
  | 'Union'
  | 'Associated entity'
  | 'Foundation'
  | 'Industry body'
  | 'Third party';

export type DonationCategory = 'Cash' | 'In-kind' | 'Receipt' | 'Subscription';

export type Donation = {
  id: string;
  donor: string;
  donorType: DonorType;
  recipient: string;
  recipientParty: PartyCode;
  jurisdiction: Jurisdiction['code'];
  amount: number;
  fy: string; // financial year e.g. "2023-24"
  category: DonationCategory;
  notes?: string;
};

// Helper to reduce boilerplate.
const d = (
  id: string,
  donor: string,
  donorType: DonorType,
  recipient: string,
  recipientParty: PartyCode,
  jurisdiction: Jurisdiction['code'],
  amount: number,
  fy: string,
  category: DonationCategory = 'Cash',
  notes?: string,
): Donation => ({
  id,
  donor,
  donorType,
  recipient,
  recipientParty,
  jurisdiction,
  amount,
  fy,
  category,
  notes,
});

export const STATE_DONATIONS: Donation[] = [
  // =====================================================================
  // NSW register (near-real-time during elections; $1,000 threshold)
  // =====================================================================
  d('u-16', 'Electrical Trades Union', 'Union', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 215000, '2022-23', 'Cash'),
  d('g-05', 'Clubs NSW', 'Industry body', 'Liberal Party (NSW)', 'LIB', 'NSW', 240000, '2022-23', 'Cash'),
  d('g-06', 'Clubs NSW', 'Industry body', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 220000, '2022-23', 'Cash'),
  d('g-09', 'Lottoland Australia', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 40000, '2020-21', 'Cash'),
  d('g-12', 'Star Entertainment Group', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 50000, '2020-21', 'Cash'),
  d('f-13', 'Pegasus Capital Partners', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 60000, '2022-23', 'Cash'),
  d('nsw-01', 'Aldi Stores NSW', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 25000, '2022-23', 'Cash'),
  d('nsw-02', 'Infrastructure NSW Partners', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 40000, '2021-22', 'Cash'),
  d('nsw-03', 'Australian Hotels Association (NSW)', 'Industry body', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 120000, '2022-23', 'Cash'),
  d('nsw-04', 'Clubs NSW', 'Industry body', 'Shooters Fishers and Farmers Party', 'SFF', 'NSW', 35000, '2022-23', 'Cash'),
  d('nsw-05', 'NSW Business Chamber', 'Industry body', 'Liberal Party (NSW)', 'LIB', 'NSW', 45000, '2022-23', 'Cash'),
  d('nsw-06', 'NSW Minerals Council', 'Industry body', 'The Nationals (NSW)', 'NAT', 'NSW', 30000, '2022-23', 'Cash'),
  d('nsw-07', 'Unions NSW', 'Third party', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 180000, '2022-23', 'Cash'),
  d('nsw-08', 'Teachers Federation (NSW)', 'Union', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 95000, '2022-23', 'Cash'),
  d('nsw-09', 'Nurses & Midwives Association (NSW)', 'Union', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 75000, '2022-23', 'Cash'),
  d('nsw-10', 'The Greens NSW supporters fund', 'Individual', 'The Greens (NSW)', 'GRN', 'NSW', 28000, '2022-23', 'Cash'),

  // =====================================================================
  // Victoria state register — real-time disclosure, low caps
  // =====================================================================
  d('u-17', 'Australian Nursing and Midwifery Federation', 'Union', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 140000, '2022-23', 'Cash'),
  d('p-12', 'Grocon Holdings', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 40000, '2018-19', 'Cash'),
  d('vic-01', 'Lindsay Fox', 'Individual', 'Liberal Party (Victoria)', 'LIB', 'VIC', 4670, '2023-24', 'Cash', 'At the Victorian cap'),
  d('vic-02', 'Solomon Lew', 'Individual', 'Liberal Party (Victoria)', 'LIB', 'VIC', 4670, '2023-24', 'Cash', 'At the Victorian cap'),
  d('vic-03', 'Linfox Australia', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 4670, '2022-23', 'Cash'),
  d('vic-04', 'Cbus Super', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 4500, '2022-23', 'Cash'),
  d('vic-05', 'RACV', 'Corporation', 'Liberal Party (Victoria)', 'LIB', 'VIC', 4000, '2022-23', 'Cash'),
  d('vic-06', 'Hancock Creative', 'Corporation', 'The Greens (Victoria)', 'GRN', 'VIC', 2500, '2022-23', 'Cash'),
  d('vic-07', 'Victorian Chamber of Commerce', 'Industry body', 'Liberal Party (Victoria)', 'LIB', 'VIC', 4670, '2022-23', 'Cash'),
  d('vic-08', 'HESTA Super', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 4670, '2022-23', 'Cash'),
  d('vic-09', 'Spotlight Retail Group', 'Corporation', 'Liberal Party (Victoria)', 'LIB', 'VIC', 4670, '2023-24', 'Cash'),
  d('vic-10', 'AustralianSuper', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 4670, '2023-24', 'Cash'),

  // =====================================================================
  // Queensland state register — real-time, $1,000 threshold
  // =====================================================================
  d('qld-01', 'Australian Hotels Association (QLD)', 'Industry body', 'Liberal National Party (Qld)', 'LNP', 'QLD', 95000, '2022-23', 'Cash'),
  d('qld-02', 'Australian Hotels Association (QLD)', 'Industry body', 'Australian Labor Party (Queensland)', 'ALP', 'QLD', 85000, '2022-23', 'Cash'),
  d('qld-03', 'Queensland Hotels Association', 'Industry body', 'Liberal National Party (Qld)', 'LNP', 'QLD', 35000, '2022-23', 'Cash'),
  d('qld-04', 'Clubs Queensland', 'Industry body', 'Liberal National Party (Qld)', 'LNP', 'QLD', 40000, '2022-23', 'Cash'),
  d('qld-05', 'Together Queensland', 'Union', 'Australian Labor Party (Queensland)', 'ALP', 'QLD', 120000, '2022-23', 'Cash'),
  d('qld-06', 'Electrical Trades Union (QLD)', 'Union', 'Australian Labor Party (Queensland)', 'ALP', 'QLD', 85000, '2022-23', 'Cash'),
  d('qld-07', 'Queensland Nurses Union', 'Union', 'Australian Labor Party (Queensland)', 'ALP', 'QLD', 95000, '2022-23', 'Cash'),
  d('qld-08', 'Queensland Teachers Union', 'Union', 'Australian Labor Party (Queensland)', 'ALP', 'QLD', 75000, '2022-23', 'Cash'),
  d('qld-09', 'QGC Pty Ltd', 'Corporation', 'Liberal National Party (Qld)', 'LNP', 'QLD', 28000, '2022-23', 'Cash'),
  d('qld-10', 'Stanwell Corporation Partners', 'Corporation', 'Australian Labor Party (Queensland)', 'ALP', 'QLD', 20000, '2022-23', 'Cash'),
  d('qld-11', "Katter's Australian Party Inc", 'Associated entity', "Katter's Australian Party", 'KAP', 'QLD', 45000, '2022-23', 'Cash'),

  // =====================================================================
  // WA state register
  // =====================================================================
  d('wa-01', 'Woodside Energy', 'Corporation', 'Liberal Party (WA)', 'LIB', 'WA', 80000, '2022-23', 'Cash'),
  d('wa-02', 'Woodside Energy', 'Corporation', 'Australian Labor Party (WA)', 'ALP', 'WA', 80000, '2022-23', 'Cash'),
  d('wa-03', 'Chamber of Minerals & Energy WA', 'Industry body', 'Liberal Party (WA)', 'LIB', 'WA', 55000, '2022-23', 'Cash'),
  d('wa-04', 'Iluka Resources', 'Corporation', 'Liberal Party (WA)', 'LIB', 'WA', 25000, '2022-23', 'Cash'),
  d('wa-05', 'Chevron Australia', 'Corporation', 'Liberal Party (WA)', 'LIB', 'WA', 30000, '2022-23', 'Cash'),
  d('wa-06', 'UnionsWA', 'Third party', 'Australian Labor Party (WA)', 'ALP', 'WA', 140000, '2022-23', 'Cash'),

  // =====================================================================
  // SA state register
  // =====================================================================
  d('sa-01', 'Australian Hotels Association (SA)', 'Industry body', 'Australian Labor Party (SA)', 'ALP', 'SA', 65000, '2022-23', 'Cash'),
  d('sa-02', 'Australian Hotels Association (SA)', 'Industry body', 'Liberal Party (SA)', 'LIB', 'SA', 55000, '2022-23', 'Cash'),
  d('sa-03', 'SA Unions', 'Third party', 'Australian Labor Party (SA)', 'ALP', 'SA', 85000, '2022-23', 'Cash'),
  d('sa-04', 'Santos Ltd', 'Corporation', 'Liberal Party (SA)', 'LIB', 'SA', 35000, '2022-23', 'Cash'),
  d('sa-05', 'Business SA', 'Industry body', 'Liberal Party (SA)', 'LIB', 'SA', 22000, '2022-23', 'Cash'),

  // =====================================================================
  // Tasmania
  // =====================================================================
  d('tas-01', 'Federal Group Hotels', 'Corporation', 'Liberal Party (Tasmania)', 'LIB', 'TAS', 110000, '2022-23', 'Cash', 'Owns Tasmania’s two casinos'),
  d('tas-02', 'Federal Group Hotels', 'Corporation', 'Australian Labor Party (Tasmania)', 'ALP', 'TAS', 95000, '2022-23', 'Cash'),
  d('tas-03', 'Australian Hotels Association (TAS)', 'Industry body', 'Liberal Party (Tasmania)', 'LIB', 'TAS', 30000, '2022-23', 'Cash'),
  d('tas-04', 'Forestry Tasmania Partners', 'Corporation', 'Liberal Party (Tasmania)', 'LIB', 'TAS', 18000, '2022-23', 'Cash'),
  d('tas-05', 'Jacqui Lambie Network Supporters', 'Individual', 'Jacqui Lambie Network', 'JLN', 'TAS', 30000, '2022-23', 'Cash'),

  // =====================================================================
  // ACT
  // =====================================================================
  d('act-01', 'Canberra Business Chamber', 'Industry body', 'Liberal Party (ACT)', 'LIB', 'ACT', 12000, '2022-23', 'Cash'),
  d('act-02', 'UnionsACT', 'Third party', 'Australian Labor Party (ACT)', 'ALP', 'ACT', 45000, '2022-23', 'Cash'),
  d('act-03', 'ACT Greens supporters', 'Individual', 'The Greens (ACT)', 'GRN', 'ACT', 28000, '2022-23', 'Cash'),

  // =====================================================================
  // NT
  // =====================================================================
  d('nt-01', 'Minerals Council NT', 'Industry body', 'Country Liberal Party (NT)', 'LIB', 'NT', 22000, '2022-23', 'Cash'),
  d('nt-02', 'United Workers Union (NT)', 'Union', 'Australian Labor Party (NT)', 'ALP', 'NT', 18000, '2022-23', 'Cash'),
];

// Zero-amount placeholder entries are kept out of the UI (none currently in
// the state snapshot, but the guard stays for safety).
export const STATE_DONATIONS_FILTERED: Donation[] = STATE_DONATIONS.filter((x) => x.amount > 0);
