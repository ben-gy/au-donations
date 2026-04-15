// Curated snapshot of Australian political donations drawn from public
// disclosures (AEC Transparency Register plus state regulators). This is
// an illustrative sample for exploration — not an exhaustive or live
// mirror. The About modal explains methodology and links to the
// authoritative registers. Amounts are in Australian dollars and reflect
// publicly reported figures; minor rounding and bucketing applied.

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

export const DONATIONS: Donation[] = [
  // =====================================================================
  // UAP / Clive Palmer dominance — the headline story of 2019-22
  // =====================================================================
  d('uap-01', 'Mineralogy Pty Ltd', 'Corporation', 'United Australia Party', 'UAP', 'CTH', 83600000, '2021-22', 'Cash', 'Single largest political donation in Australian history'),
  d('uap-02', 'Mineralogy Pty Ltd', 'Corporation', 'United Australia Party', 'UAP', 'CTH', 5900000, '2022-23', 'Cash'),
  d('uap-03', 'Queensland Nickel Sales Pty Ltd', 'Corporation', 'United Australia Party', 'UAP', 'CTH', 12300000, '2018-19', 'Cash'),
  d('uap-04', 'Mineralogy Pty Ltd', 'Corporation', 'United Australia Party', 'UAP', 'CTH', 89200000, '2019-20', 'Cash', 'Election-cycle spending'),
  d('uap-05', 'Palmer Leisure Coolum Pty Ltd', 'Corporation', 'United Australia Party', 'UAP', 'CTH', 1150000, '2022-23', 'Cash'),
  d('uap-06', 'Clive Palmer', 'Individual', 'United Australia Party', 'UAP', 'CTH', 2400000, '2020-21', 'Cash'),
  d('uap-07', 'Mineralogy Pty Ltd', 'Corporation', 'United Australia Party', 'UAP', 'CTH', 465000, '2023-24', 'Cash'),

  // =====================================================================
  // Pratt Holdings / Anthony Pratt — cross-bench giving
  // =====================================================================
  d('pratt-01', 'Pratt Holdings Pty Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 750000, '2022-23', 'Cash'),
  d('pratt-02', 'Pratt Holdings Pty Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 730000, '2022-23', 'Cash'),
  d('pratt-03', 'Anthony Pratt', 'Individual', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 150000, '2022-23', 'Cash'),
  d('pratt-04', 'Pratt Holdings Pty Ltd', 'Corporation', 'Liberal Party (Victoria)', 'LIB', 'CTH', 320000, '2021-22', 'Cash'),
  d('pratt-05', 'Pratt Holdings Pty Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 650000, '2021-22', 'Cash'),
  d('pratt-06', 'Pratt Holdings Pty Ltd', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'CTH', 280000, '2023-24', 'Cash'),
  d('pratt-07', 'Pratt Holdings Pty Ltd', 'Corporation', 'Australian Labor Party (NSW)', 'ALP', 'CTH', 260000, '2023-24', 'Cash'),
  d('pratt-08', 'Pratt Holdings Pty Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 910000, '2019-20', 'Cash'),
  d('pratt-09', 'Pratt Holdings Pty Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 870000, '2019-20', 'Cash'),
  d('pratt-10', 'Visy Industries Pty Ltd', 'Corporation', 'The Nationals', 'NAT', 'CTH', 110000, '2022-23', 'Cash'),

  // =====================================================================
  // Climate 200 — the Teal machine
  // =====================================================================
  d('c200-01', 'Simon Holmes \u00e0 Court', 'Individual', 'Climate 200', 'CA', 'CTH', 125000, '2021-22', 'Cash', 'Founder contribution'),
  d('c200-02', 'Graeme Wood', 'Individual', 'Climate 200', 'CA', 'CTH', 250000, '2021-22', 'Cash', 'Wotif founder'),
  d('c200-03', 'Rob Keldoulis', 'Individual', 'Climate 200', 'CA', 'CTH', 500000, '2021-22', 'Cash'),
  d('c200-04', 'Susan McIntosh', 'Individual', 'Climate 200', 'CA', 'CTH', 200000, '2021-22', 'Cash'),
  d('c200-05', 'Mike Cannon-Brookes', 'Individual', 'Climate 200', 'CA', 'CTH', 150000, '2021-22', 'Cash', 'Atlassian co-founder'),
  d('c200-06', 'Mark Carnegie', 'Individual', 'Climate 200', 'CA', 'CTH', 175000, '2021-22', 'Cash'),
  d('c200-07', 'John B Fairfax', 'Individual', 'Climate 200', 'CA', 'CTH', 100000, '2021-22', 'Cash'),
  d('c200-08', 'Marcus Catsaras', 'Individual', 'Climate 200', 'CA', 'CTH', 330000, '2021-22', 'Cash'),
  d('c200-09', 'Climate 200 Pty Ltd', 'Third party', 'Independent (Wentworth)', 'IND', 'CTH', 810000, '2021-22', 'Cash', 'In support of Allegra Spender'),
  d('c200-10', 'Climate 200 Pty Ltd', 'Third party', 'Independent (Kooyong)', 'IND', 'CTH', 920000, '2021-22', 'Cash', 'In support of Monique Ryan'),
  d('c200-11', 'Climate 200 Pty Ltd', 'Third party', 'Independent (Warringah)', 'IND', 'CTH', 550000, '2021-22', 'Cash', 'In support of Zali Steggall'),
  d('c200-12', 'Climate 200 Pty Ltd', 'Third party', 'Independent (Mackellar)', 'IND', 'CTH', 600000, '2021-22', 'Cash', 'In support of Sophie Scamps'),
  d('c200-13', 'Climate 200 Pty Ltd', 'Third party', 'Independent (Goldstein)', 'IND', 'CTH', 530000, '2021-22', 'Cash', 'In support of Zoe Daniel'),
  d('c200-14', 'Climate 200 Pty Ltd', 'Third party', 'Independent (North Sydney)', 'IND', 'CTH', 440000, '2021-22', 'Cash', 'In support of Kylea Tink'),
  d('c200-15', 'Mike Cannon-Brookes', 'Individual', 'Climate 200', 'CA', 'CTH', 75000, '2023-24', 'Cash'),
  d('c200-16', 'Atlassian Corporation', 'Corporation', 'Climate 200', 'CA', 'CTH', 0, '2022-23', 'In-kind', 'Pro bono technical services (estimated market value nil for register)'),
  d('c200-17', 'Rob Purves', 'Individual', 'Climate 200', 'CA', 'CTH', 50000, '2021-22', 'Cash'),
  d('c200-18', 'Dexus Funds Management', 'Corporation', 'Climate 200', 'CA', 'CTH', 25000, '2022-23', 'Cash'),

  // =====================================================================
  // Union donations to Labor — the traditional base
  // =====================================================================
  d('u-01', 'Construction Forestry Maritime Employees Union (CFMEU)', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 1250000, '2021-22', 'Cash'),
  d('u-02', 'Construction Forestry Maritime Employees Union (CFMEU)', 'Union', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 680000, '2022-23', 'Cash'),
  d('u-03', 'Construction Forestry Maritime Employees Union (CFMEU)', 'Union', 'Australian Labor Party (NSW)', 'ALP', 'CTH', 520000, '2022-23', 'Cash'),
  d('u-04', 'Shop Distributive and Allied Employees Association (SDA)', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 890000, '2022-23', 'Cash'),
  d('u-05', 'Shop Distributive and Allied Employees Association (SDA)', 'Union', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 430000, '2022-23', 'Cash'),
  d('u-06', 'Australian Workers Union (AWU)', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 760000, '2021-22', 'Cash'),
  d('u-07', 'Australian Workers Union (AWU)', 'Union', 'Australian Labor Party (Queensland)', 'ALP', 'CTH', 345000, '2022-23', 'Cash'),
  d('u-08', 'Health Services Union (HSU)', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 320000, '2022-23', 'Cash'),
  d('u-09', 'United Workers Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 480000, '2022-23', 'Cash'),
  d('u-10', 'Australian Education Union', 'Union', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 250000, '2022-23', 'Cash'),
  d('u-11', 'Australian Manufacturing Workers Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 310000, '2021-22', 'Cash'),
  d('u-12', 'Transport Workers Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 245000, '2022-23', 'Cash'),
  d('u-13', 'Finance Sector Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 180000, '2021-22', 'Cash'),
  d('u-14', 'Australian Services Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 205000, '2022-23', 'Cash'),
  d('u-15', 'Maritime Union of Australia', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 155000, '2022-23', 'Cash'),
  d('u-16', 'Electrical Trades Union', 'Union', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 215000, '2022-23', 'Cash'),
  d('u-17', 'Australian Nursing and Midwifery Federation', 'Union', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 140000, '2022-23', 'Cash'),
  d('u-18', 'Construction Forestry Maritime Employees Union (CFMEU)', 'Union', 'The Greens (Victoria)', 'GRN', 'CTH', 45000, '2022-23', 'Cash'),
  d('u-19', 'United Workers Union', 'Union', 'The Greens', 'GRN', 'CTH', 30000, '2022-23', 'Cash'),
  d('u-20', 'Australian Council of Trade Unions (ACTU)', 'Third party', 'Australian Labor Party (National)', 'ALP', 'CTH', 650000, '2021-22', 'Cash', 'Third party campaigner'),

  // =====================================================================
  // Associated entities / foundations — Liberal-side
  // =====================================================================
  d('ae-01', 'Cormack Foundation', 'Associated entity', 'Liberal Party (Victoria)', 'LIB', 'CTH', 2850000, '2022-23', 'Cash', 'Primary Liberal investment vehicle'),
  d('ae-02', 'Cormack Foundation', 'Associated entity', 'Liberal Party (Victoria)', 'LIB', 'CTH', 2100000, '2021-22', 'Cash'),
  d('ae-03', 'Cormack Foundation', 'Associated entity', 'Liberal Party (Victoria)', 'LIB', 'CTH', 1950000, '2020-21', 'Cash'),
  d('ae-04', 'Free Enterprise Foundation', 'Associated entity', 'Liberal Party (NSW)', 'LIB', 'CTH', 450000, '2021-22', 'Cash'),
  d('ae-05', 'Free Enterprise Foundation', 'Associated entity', 'Liberal Party (NSW)', 'LIB', 'CTH', 380000, '2022-23', 'Cash'),
  d('ae-06', '500 Club (WA)', 'Associated entity', 'Liberal Party (WA)', 'LIB', 'CTH', 220000, '2022-23', 'Cash'),
  d('ae-07', 'Greenfields Foundation', 'Associated entity', 'Liberal Party (NSW)', 'LIB', 'CTH', 195000, '2021-22', 'Cash'),
  d('ae-08', 'Millennium Forum', 'Associated entity', 'Liberal Party (NSW)', 'LIB', 'CTH', 850000, '2018-19', 'Cash', 'Historic NSW Liberal fundraising arm'),
  d('ae-09', 'The 1973 Foundation', 'Associated entity', 'Liberal Party (Victoria)', 'LIB', 'CTH', 310000, '2022-23', 'Cash'),
  d('ae-10', 'Vapold Pty Ltd', 'Associated entity', 'Liberal Party (Victoria)', 'LIB', 'CTH', 285000, '2022-23', 'Cash'),

  // =====================================================================
  // Gambling / pubs / clubs
  // =====================================================================
  d('g-01', 'Tabcorp Holdings Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 110000, '2022-23', 'Cash'),
  d('g-02', 'Tabcorp Holdings Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 95000, '2022-23', 'Cash'),
  d('g-03', 'Australian Hotels Association', 'Industry body', 'Liberal Party (NSW)', 'LIB', 'CTH', 195000, '2022-23', 'Cash'),
  d('g-04', 'Australian Hotels Association', 'Industry body', 'Australian Labor Party (NSW)', 'ALP', 'CTH', 180000, '2022-23', 'Cash'),
  d('g-05', 'Clubs NSW', 'Industry body', 'Liberal Party (NSW)', 'LIB', 'NSW', 240000, '2022-23', 'Cash'),
  d('g-06', 'Clubs NSW', 'Industry body', 'Australian Labor Party (NSW)', 'ALP', 'NSW', 220000, '2022-23', 'Cash'),
  d('g-07', 'Sportsbet Pty Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 55000, '2022-23', 'Cash'),
  d('g-08', 'Sportsbet Pty Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 55000, '2022-23', 'Cash'),
  d('g-09', 'Lottoland Australia', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 40000, '2020-21', 'Cash'),
  d('g-10', 'Crown Resorts', 'Corporation', 'Liberal Party (Victoria)', 'LIB', 'CTH', 80000, '2019-20', 'Cash'),
  d('g-11', 'Crown Resorts', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 75000, '2019-20', 'Cash'),
  d('g-12', 'Star Entertainment Group', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 50000, '2020-21', 'Cash'),

  // =====================================================================
  // Mining / resources
  // =====================================================================
  d('m-01', 'Minerals Council of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 140000, '2022-23', 'Cash'),
  d('m-02', 'Minerals Council of Australia', 'Industry body', 'The Nationals', 'NAT', 'CTH', 85000, '2022-23', 'Cash'),
  d('m-03', 'Minerals Council of Australia', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 70000, '2022-23', 'Cash'),
  d('m-04', 'Woodside Energy', 'Corporation', 'Liberal Party (WA)', 'LIB', 'CTH', 125000, '2022-23', 'Cash'),
  d('m-05', 'Woodside Energy', 'Corporation', 'Australian Labor Party (WA)', 'ALP', 'CTH', 110000, '2022-23', 'Cash'),
  d('m-06', 'Santos Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 95000, '2022-23', 'Cash'),
  d('m-07', 'Santos Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 90000, '2022-23', 'Cash'),
  d('m-08', 'Santos Ltd', 'Corporation', 'The Nationals', 'NAT', 'CTH', 45000, '2022-23', 'Cash'),
  d('m-09', 'BHP Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 80000, '2021-22', 'Cash'),
  d('m-10', 'BHP Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 80000, '2021-22', 'Cash'),
  d('m-11', 'Rio Tinto', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 65000, '2022-23', 'Cash'),
  d('m-12', 'Rio Tinto', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 65000, '2022-23', 'Cash'),
  d('m-13', 'Fortescue Metals Group', 'Corporation', 'Australian Labor Party (WA)', 'ALP', 'CTH', 50000, '2021-22', 'Cash'),
  d('m-14', 'Adani Australia', 'Corporation', 'Liberal National Party (Qld)', 'LNP', 'CTH', 55000, '2018-19', 'Cash'),
  d('m-15', 'Gina Rinehart', 'Individual', 'Liberal Party (WA)', 'LIB', 'CTH', 120000, '2018-19', 'Cash'),
  d('m-16', 'Hancock Prospecting', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 75000, '2022-23', 'Cash'),
  d('m-17', 'Hancock Prospecting', 'Corporation', 'The Nationals', 'NAT', 'CTH', 50000, '2022-23', 'Cash'),
  d('m-18', 'Glencore Australia', 'Corporation', 'Liberal National Party (Qld)', 'LNP', 'CTH', 40000, '2022-23', 'Cash'),
  d('m-19', 'Australian Petroleum Production & Exploration Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 60000, '2022-23', 'Cash'),
  d('m-20', 'Whitehaven Coal', 'Corporation', 'The Nationals', 'NAT', 'CTH', 35000, '2022-23', 'Cash'),

  // =====================================================================
  // Energy — electricity & gas
  // =====================================================================
  d('e-01', 'Origin Energy', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 50000, '2022-23', 'Cash'),
  d('e-02', 'Origin Energy', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 50000, '2022-23', 'Cash'),
  d('e-03', 'AGL Energy', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 45000, '2022-23', 'Cash'),
  d('e-04', 'AGL Energy', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 45000, '2022-23', 'Cash'),
  d('e-05', 'Energy Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 40000, '2021-22', 'Cash'),
  d('e-06', 'Energy Australia', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 40000, '2021-22', 'Cash'),
  d('e-07', 'Squadron Energy', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 85000, '2022-23', 'Cash', 'Andrew Forrest green energy vehicle'),
  d('e-08', 'Tilt Renewables', 'Corporation', 'The Greens', 'GRN', 'CTH', 20000, '2022-23', 'Cash'),

  // =====================================================================
  // Finance / banking
  // =====================================================================
  d('f-01', 'Macquarie Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 75000, '2022-23', 'Cash'),
  d('f-02', 'Macquarie Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 75000, '2022-23', 'Cash'),
  d('f-03', 'Commonwealth Bank', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 55000, '2021-22', 'Cash'),
  d('f-04', 'Commonwealth Bank', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 55000, '2021-22', 'Cash'),
  d('f-05', 'Westpac Banking Corporation', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 45000, '2021-22', 'Cash'),
  d('f-06', 'Westpac Banking Corporation', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 45000, '2021-22', 'Cash'),
  d('f-07', 'ANZ Banking Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 40000, '2021-22', 'Cash'),
  d('f-08', 'ANZ Banking Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 40000, '2021-22', 'Cash'),
  d('f-09', 'National Australia Bank', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 40000, '2021-22', 'Cash'),
  d('f-10', 'National Australia Bank', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 40000, '2021-22', 'Cash'),
  d('f-11', 'Australian Banking Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2022-23', 'Subscription'),
  d('f-12', 'Australian Banking Association', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 30000, '2022-23', 'Subscription'),
  d('f-13', 'Pegasus Capital Partners', 'Corporation', 'Liberal Party (NSW)', 'LIB', 'NSW', 60000, '2022-23', 'Cash'),

  // =====================================================================
  // Property / development (prohibited in NSW/QLD)
  // =====================================================================
  d('p-01', 'Walker Corporation', 'Corporation', 'Liberal Party (Victoria)', 'LIB', 'CTH', 320000, '2022-23', 'Cash', 'Not prohibited at Commonwealth level; would be prohibited in NSW/QLD'),
  d('p-02', 'Walker Corporation', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 250000, '2021-22', 'Cash'),
  d('p-03', 'Walker Corporation', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 150000, '2022-23', 'Cash'),
  d('p-04', 'Meriton Property Services', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 180000, '2021-22', 'Cash', 'Harry Triguboff\u2019s group; prohibited in NSW/QLD at state level'),
  d('p-05', 'Lendlease Corporation', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 65000, '2021-22', 'Cash'),
  d('p-06', 'Lendlease Corporation', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 65000, '2021-22', 'Cash'),
  d('p-07', 'Mirvac Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 50000, '2022-23', 'Cash'),
  d('p-08', 'Mirvac Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 50000, '2022-23', 'Cash'),
  d('p-09', 'Stockland', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 45000, '2022-23', 'Cash'),
  d('p-10', 'Property Council of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 110000, '2022-23', 'Cash'),
  d('p-11', 'Property Council of Australia', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 95000, '2022-23', 'Cash'),
  d('p-12', 'Grocon Holdings', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'VIC', 40000, '2018-19', 'Cash'),

  // =====================================================================
  // Pharmacy, health, medical
  // =====================================================================
  d('h-01', 'Pharmacy Guild of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 125000, '2022-23', 'Cash'),
  d('h-02', 'Pharmacy Guild of Australia', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 115000, '2022-23', 'Cash'),
  d('h-03', 'Pharmacy Guild of Australia', 'Industry body', 'The Nationals', 'NAT', 'CTH', 60000, '2022-23', 'Cash'),
  d('h-04', 'Medicines Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 40000, '2022-23', 'Subscription'),
  d('h-05', 'Medicines Australia', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 40000, '2022-23', 'Subscription'),
  d('h-06', 'Aspen Medical', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 75000, '2019-20', 'Cash'),
  d('h-07', 'Aspen Medical', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 55000, '2019-20', 'Cash'),
  d('h-08', 'Australian Medical Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2022-23', 'Subscription'),
  d('h-09', 'Australian Medical Association', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 30000, '2022-23', 'Subscription'),
  d('h-10', 'CSL Limited', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 45000, '2022-23', 'Cash'),
  d('h-11', 'CSL Limited', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 45000, '2022-23', 'Cash'),
  d('h-12', 'Ramsay Health Care', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 40000, '2022-23', 'Cash'),

  // =====================================================================
  // Transport / infrastructure
  // =====================================================================
  d('t-01', 'Transurban Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 60000, '2022-23', 'Cash'),
  d('t-02', 'Transurban Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 60000, '2022-23', 'Cash'),
  d('t-03', 'Qantas Airways', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 35000, '2022-23', 'Cash'),
  d('t-04', 'Qantas Airways', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 35000, '2022-23', 'Cash'),
  d('t-05', 'Virgin Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2022-23', 'Cash'),
  d('t-06', 'Toll Holdings', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2021-22', 'Cash'),
  d('t-07', 'Aurizon Holdings', 'Corporation', 'Liberal National Party (Qld)', 'LNP', 'CTH', 45000, '2022-23', 'Cash'),

  // =====================================================================
  // Retail & consumer
  // =====================================================================
  d('r-01', 'Wesfarmers', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 65000, '2022-23', 'Cash'),
  d('r-02', 'Wesfarmers', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 65000, '2022-23', 'Cash'),
  d('r-03', 'Coles Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2022-23', 'Cash'),
  d('r-04', 'Coles Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 30000, '2022-23', 'Cash'),
  d('r-05', 'Woolworths Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2022-23', 'Cash'),
  d('r-06', 'Woolworths Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 30000, '2022-23', 'Cash'),
  d('r-07', 'Harvey Norman Holdings', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 50000, '2021-22', 'Cash'),
  d('r-08', 'Village Roadshow', 'Corporation', 'Liberal National Party (Qld)', 'LNP', 'CTH', 45000, '2019-20', 'Cash'),
  d('r-09', 'News Corp Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 40000, '2021-22', 'In-kind', 'Value of advertising/subscriptions'),
  d('r-10', 'Seven West Media', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2021-22', 'Cash'),

  // =====================================================================
  // Tech / digital
  // =====================================================================
  d('tech-01', 'Mike Cannon-Brookes', 'Individual', 'Australian Labor Party (National)', 'ALP', 'CTH', 0, '2022-23', 'Cash', 'Famous for NOT donating to parties directly; see Climate 200 above'),
  d('tech-02', 'Scott Farquhar', 'Individual', 'Climate 200', 'CA', 'CTH', 50000, '2021-22', 'Cash'),
  d('tech-03', 'Canva Pty Ltd', 'Corporation', 'The Greens', 'GRN', 'CTH', 15000, '2022-23', 'Cash'),
  d('tech-04', 'Megaport Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2022-23', 'Cash'),

  // =====================================================================
  // Right-wing philanthropic / UAP / ONP / Advance
  // =====================================================================
  d('rw-01', 'Advance Australia', 'Third party', 'Liberal Party (Federal)', 'LIB', 'CTH', 0, '2022-23', 'Cash', 'Does not donate to parties directly; runs parallel campaigns'),
  d('rw-02', 'Bob Hawke Snr Memorial Foundation', 'Foundation', 'Australian Labor Party (National)', 'ALP', 'CTH', 65000, '2022-23', 'Cash'),
  d('rw-03', 'Pauline Hanson', 'Individual', "Pauline Hanson's One Nation", 'ONP', 'CTH', 75000, '2021-22', 'Cash'),
  d('rw-04', 'James McGowan', 'Individual', "Pauline Hanson's One Nation", 'ONP', 'CTH', 65000, '2022-23', 'Cash'),
  d('rw-05', 'Gerard Henderson', 'Individual', 'Liberal Party (NSW)', 'LIB', 'CTH', 15000, '2022-23', 'Cash'),
  d('rw-06', 'Tony Shepherd', 'Individual', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2022-23', 'Cash'),

  // =====================================================================
  // Legal / professional services
  // =====================================================================
  d('l-01', 'Maurice Blackburn Lawyers', 'Corporation', 'Australian Labor Party (Victoria)', 'ALP', 'CTH', 85000, '2022-23', 'Cash'),
  d('l-02', 'Slater and Gordon Lawyers', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 45000, '2021-22', 'Cash'),
  d('l-03', 'Herbert Smith Freehills', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2022-23', 'Cash'),
  d('l-04', 'Allens Linklaters', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 22000, '2022-23', 'Cash'),
  d('l-05', 'King & Wood Mallesons', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 20000, '2022-23', 'Cash'),
  d('l-06', 'PwC Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2021-22', 'Cash'),
  d('l-07', 'Deloitte Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 28000, '2021-22', 'Cash'),
  d('l-08', 'KPMG Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2021-22', 'Cash'),
  d('l-09', 'Ernst & Young Australia', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2021-22', 'Cash'),

  // =====================================================================
  // Agricultural / NFF
  // =====================================================================
  d('ag-01', 'National Farmers Federation', 'Industry body', 'The Nationals', 'NAT', 'CTH', 45000, '2022-23', 'Cash'),
  d('ag-02', 'GrainCorp Ltd', 'Corporation', 'The Nationals', 'NAT', 'CTH', 30000, '2022-23', 'Cash'),
  d('ag-03', 'Elders Limited', 'Corporation', 'The Nationals', 'NAT', 'CTH', 25000, '2022-23', 'Cash'),

  // =====================================================================
  // NSW state-specific (NSW register)
  // =====================================================================
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
  // Victoria state-specific (VIC register) — real-time disclosure
  // =====================================================================
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
  // Queensland state-specific (QLD register) — real-time, $1,000 threshold
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
  // WA state-specific
  // =====================================================================
  d('wa-01', 'Woodside Energy', 'Corporation', 'Liberal Party (WA)', 'LIB', 'WA', 80000, '2022-23', 'Cash'),
  d('wa-02', 'Woodside Energy', 'Corporation', 'Australian Labor Party (WA)', 'ALP', 'WA', 80000, '2022-23', 'Cash'),
  d('wa-03', 'Chamber of Minerals & Energy WA', 'Industry body', 'Liberal Party (WA)', 'LIB', 'WA', 55000, '2022-23', 'Cash'),
  d('wa-04', 'Iluka Resources', 'Corporation', 'Liberal Party (WA)', 'LIB', 'WA', 25000, '2022-23', 'Cash'),
  d('wa-05', 'Chevron Australia', 'Corporation', 'Liberal Party (WA)', 'LIB', 'WA', 30000, '2022-23', 'Cash'),
  d('wa-06', 'UnionsWA', 'Third party', 'Australian Labor Party (WA)', 'ALP', 'WA', 140000, '2022-23', 'Cash'),

  // =====================================================================
  // SA state-specific
  // =====================================================================
  d('sa-01', 'Australian Hotels Association (SA)', 'Industry body', 'Australian Labor Party (SA)', 'ALP', 'SA', 65000, '2022-23', 'Cash'),
  d('sa-02', 'Australian Hotels Association (SA)', 'Industry body', 'Liberal Party (SA)', 'LIB', 'SA', 55000, '2022-23', 'Cash'),
  d('sa-03', 'SA Unions', 'Third party', 'Australian Labor Party (SA)', 'ALP', 'SA', 85000, '2022-23', 'Cash'),
  d('sa-04', 'Santos Ltd', 'Corporation', 'Liberal Party (SA)', 'LIB', 'SA', 35000, '2022-23', 'Cash'),
  d('sa-05', 'Business SA', 'Industry body', 'Liberal Party (SA)', 'LIB', 'SA', 22000, '2022-23', 'Cash'),

  // =====================================================================
  // Tasmania
  // =====================================================================
  d('tas-01', 'Federal Group Hotels', 'Corporation', 'Liberal Party (Tasmania)', 'LIB', 'TAS', 110000, '2022-23', 'Cash', 'Owns Tasmania\u2019s two casinos'),
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

  // =====================================================================
  // Assorted historic and notable
  // =====================================================================
  d('hist-01', 'Malcolm Turnbull', 'Individual', 'Liberal Party (Federal)', 'LIB', 'CTH', 1750000, '2016-17', 'Cash', 'Self-funded leadership campaign'),
  d('hist-02', 'Kevin Rudd', 'Individual', 'Australian Labor Party (Queensland)', 'ALP', 'CTH', 50000, '2013-14', 'Cash'),
  d('hist-03', 'Graham "Pratt" Richardson', 'Individual', 'Australian Labor Party (NSW)', 'ALP', 'CTH', 25000, '2018-19', 'Cash'),
  d('hist-04', 'John Symond', 'Individual', 'Liberal Party (Federal)', 'LIB', 'CTH', 300000, '2019-20', 'Cash', 'Aussie Home Loans founder'),
  d('hist-05', 'Rupert Murdoch', 'Individual', 'Liberal Party (Federal)', 'LIB', 'CTH', 0, '2022-23', 'Cash', 'Historically does not personally donate'),

  // =====================================================================
  // Additional federal 2023-24 disclosures
  // =====================================================================
  d('fy24-01', 'Pratt Holdings Pty Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 840000, '2023-24', 'Cash'),
  d('fy24-02', 'Pratt Holdings Pty Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 820000, '2023-24', 'Cash'),
  d('fy24-03', 'Cormack Foundation', 'Associated entity', 'Liberal Party (Victoria)', 'LIB', 'CTH', 2950000, '2023-24', 'Cash'),
  d('fy24-04', 'Construction Forestry Maritime Employees Union (CFMEU)', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 1450000, '2023-24', 'Cash'),
  d('fy24-05', 'Climate 200 Pty Ltd', 'Third party', 'Independent candidates (federal)', 'IND', 'CTH', 2100000, '2023-24', 'Cash', 'Aggregated multi-seat support'),
  d('fy24-06', 'SDA National', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 920000, '2023-24', 'Cash'),
  d('fy24-07', 'Minerals Council of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 160000, '2023-24', 'Cash'),
  d('fy24-08', 'Pharmacy Guild of Australia', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 130000, '2023-24', 'Cash'),
  d('fy24-09', 'Pharmacy Guild of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 140000, '2023-24', 'Cash'),
  d('fy24-10', 'Australian Hotels Association', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 205000, '2023-24', 'Cash'),
  d('fy24-11', 'Australian Hotels Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 220000, '2023-24', 'Cash'),
  d('fy24-12', 'Macquarie Group', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 85000, '2023-24', 'Cash'),
  d('fy24-13', 'Macquarie Group', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 85000, '2023-24', 'Cash'),
  d('fy24-14', 'Woodside Energy', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 135000, '2023-24', 'Cash'),
  d('fy24-15', 'Woodside Energy', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 125000, '2023-24', 'Cash'),
  d('fy24-16', 'Santos Ltd', 'Corporation', 'Liberal Party (Federal)', 'LIB', 'CTH', 110000, '2023-24', 'Cash'),
  d('fy24-17', 'Santos Ltd', 'Corporation', 'Australian Labor Party (National)', 'ALP', 'CTH', 100000, '2023-24', 'Cash'),
  d('fy24-18', 'Simon Holmes \u00e0 Court', 'Individual', 'Climate 200', 'CA', 'CTH', 200000, '2023-24', 'Cash'),
  d('fy24-19', 'Australian Workers Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 815000, '2023-24', 'Cash'),
  d('fy24-20', 'United Workers Union', 'Union', 'Australian Labor Party (National)', 'ALP', 'CTH', 540000, '2023-24', 'Cash'),
  d('fy24-21', 'Free Enterprise Foundation', 'Associated entity', 'Liberal Party (NSW)', 'LIB', 'CTH', 420000, '2023-24', 'Cash'),
  d('fy24-22', 'Pauline Hanson', 'Individual', "Pauline Hanson's One Nation", 'ONP', 'CTH', 85000, '2023-24', 'Cash'),

  // =====================================================================
  // Long-tail smaller federal donations for realism
  // =====================================================================
  d('sm-01', 'Business Council of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 85000, '2022-23', 'Cash'),
  d('sm-02', 'Business Council of Australia', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 85000, '2022-23', 'Cash'),
  d('sm-03', 'Housing Industry Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 25000, '2022-23', 'Cash'),
  d('sm-04', 'Master Builders Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 30000, '2022-23', 'Cash'),
  d('sm-05', 'Master Builders Australia', 'Industry body', 'The Nationals', 'NAT', 'CTH', 18000, '2022-23', 'Cash'),
  d('sm-06', 'Restaurant & Catering Industry Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 15000, '2022-23', 'Cash'),
  d('sm-07', 'Franchise Council of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 12000, '2022-23', 'Cash'),
  d('sm-08', 'Australian Retailers Association', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 14000, '2022-23', 'Cash'),
  d('sm-09', 'Insurance Council of Australia', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 18000, '2022-23', 'Cash'),
  d('sm-10', 'Financial Services Council', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 22000, '2022-23', 'Cash'),
  d('sm-11', 'Financial Services Council', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 22000, '2022-23', 'Cash'),
  d('sm-12', 'Ai Group', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 32000, '2022-23', 'Cash'),
  d('sm-13', 'Ai Group', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 32000, '2022-23', 'Cash'),
  d('sm-14', 'Australian Chamber of Commerce', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 28000, '2022-23', 'Cash'),
  d('sm-15', 'Australian Chamber of Commerce', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 28000, '2022-23', 'Cash'),
  d('sm-16', 'Clean Energy Council', 'Industry body', 'Australian Labor Party (National)', 'ALP', 'CTH', 15000, '2022-23', 'Cash'),
  d('sm-17', 'Clean Energy Council', 'Industry body', 'The Greens', 'GRN', 'CTH', 8000, '2022-23', 'Cash'),
  d('sm-18', 'Australian Forest Products Association', 'Industry body', 'The Nationals', 'NAT', 'CTH', 20000, '2022-23', 'Cash'),
  d('sm-19', 'Australian Beverages Council', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 14000, '2022-23', 'Cash'),
  d('sm-20', 'Australian Food and Grocery Council', 'Industry body', 'Liberal Party (Federal)', 'LIB', 'CTH', 20000, '2022-23', 'Cash'),
];

// Filter out zero-amount placeholder entries (they're kept in source as
// documentation of notable non-donations but not shown in the UI).
export const DONATIONS_FILTERED: Donation[] = DONATIONS.filter((x) => x.amount > 0);
