// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// Comparison data for Australia's 8 political donation disclosure regimes.
// Thresholds and cadence figures reflect publicly documented rules as of
// early 2026 and are summarised in the About modal. Amounts in AUD.

export type Jurisdiction = {
  code: 'CTH' | 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
  name: string;
  regulator: string;
  regulatorUrl: string;
  disclosureThreshold: number;
  thresholdNote: string;
  cadence: 'Real-time' | 'Continuous' | 'Quarterly' | 'Annual' | 'Annual + event';
  lagDescription: string;
  realTime: boolean;
  indexed: boolean;
  notes: string;
};

export const JURISDICTIONS: Jurisdiction[] = [
  {
    code: 'CTH',
    name: 'Commonwealth (Federal)',
    regulator: 'Australian Electoral Commission',
    regulatorUrl: 'https://transparency.aec.gov.au/',
    disclosureThreshold: 16900,
    thresholdNote: 'Indexed annually to CPI. 2024-25 threshold used here.',
    cadence: 'Annual',
    lagDescription: 'Returns for a financial year are published on the first working day of February eight months later.',
    realTime: false,
    indexed: true,
    notes: 'Aggregation of related donors avoids threshold splitting. Associated entities (e.g. Cormack Foundation) file separately.',
  },
  {
    code: 'NSW',
    name: 'New South Wales',
    regulator: 'NSW Electoral Commission',
    regulatorUrl: 'https://www.elections.nsw.gov.au/funding-and-disclosure/disclosures',
    disclosureThreshold: 1000,
    thresholdNote: 'Aggregate $1,000 per donor per financial year.',
    cadence: 'Continuous',
    lagDescription: 'Party disclosures twice yearly; candidate & third party disclosures continuous during election periods.',
    realTime: false,
    indexed: false,
    notes: 'Caps apply: political donations are capped at $7,200 (party) and $3,200 (candidate) per year. Property developers are prohibited donors.',
  },
  {
    code: 'VIC',
    name: 'Victoria',
    regulator: 'Victorian Electoral Commission',
    regulatorUrl: 'https://www.vec.vic.gov.au/candidates-and-parties/donations',
    disclosureThreshold: 1170,
    thresholdNote: 'Indexed. General cap on political donations is $4,670 over four years.',
    cadence: 'Real-time',
    lagDescription: 'Donors and recipients must disclose within 21 days. Register updated within 30 days.',
    realTime: true,
    indexed: true,
    notes: 'Victoria has the strictest regime: real-time disclosure with a low cap. Foreign donations prohibited.',
  },
  {
    code: 'QLD',
    name: 'Queensland',
    regulator: 'Electoral Commission of Queensland',
    regulatorUrl: 'https://disclosures.ecq.qld.gov.au/',
    disclosureThreshold: 1000,
    thresholdNote: 'Aggregated per financial year.',
    cadence: 'Real-time',
    lagDescription: 'Gifts must be disclosed within 7 business days. Public register updates in near real time.',
    realTime: true,
    indexed: false,
    notes: 'Property developers are prohibited donors. Real-time register is one of the most transparent in Australia.',
  },
  {
    code: 'WA',
    name: 'Western Australia',
    regulator: 'Western Australian Electoral Commission',
    regulatorUrl: 'https://www.elections.wa.gov.au/elections/candidates-parties/disclosure',
    disclosureThreshold: 2700,
    thresholdNote: 'Indexed annually.',
    cadence: 'Annual',
    lagDescription: 'Returns due 90 days after end of financial year.',
    realTime: false,
    indexed: true,
    notes: 'No caps on donation amounts. Election-period returns also required for elections.',
  },
  {
    code: 'SA',
    name: 'South Australia',
    regulator: 'Electoral Commission of South Australia',
    regulatorUrl: 'https://www.ecsa.sa.gov.au/elections/funding-and-disclosure',
    disclosureThreshold: 5432,
    thresholdNote: 'Indexed annually; mirrors Commonwealth formula until 2018 reforms diverged.',
    cadence: 'Annual',
    lagDescription: 'Returns for a financial year lodged by 30 September; published thereafter.',
    realTime: false,
    indexed: true,
    notes: 'Public funding is tied to election results. New caps legislation passed 2024; phased in 2025-26.',
  },
  {
    code: 'TAS',
    name: 'Tasmania',
    regulator: 'Tasmanian Electoral Commission',
    regulatorUrl: 'https://tec.tas.gov.au/',
    disclosureThreshold: 5000,
    thresholdNote: 'Introduced by 2023 reforms; previously Tasmania had no ongoing state-level regime.',
    cadence: 'Annual + event',
    lagDescription: 'Annual returns plus event-triggered disclosures during elections. First full register: 2024.',
    realTime: false,
    indexed: false,
    notes: 'Historically the least-disclosed jurisdiction. Post-2023 reforms introduced continuous disclosure for election periods.',
  },
  {
    code: 'ACT',
    name: 'Australian Capital Territory',
    regulator: 'Elections ACT',
    regulatorUrl: 'https://www.elections.act.gov.au/',
    disclosureThreshold: 1000,
    thresholdNote: 'Aggregated per reporting period.',
    cadence: 'Quarterly',
    lagDescription: 'Quarterly returns during non-election years; weekly during 7 days before polling day.',
    realTime: false,
    indexed: false,
    notes: 'Annual cap of $10,000 per donor per party. Public funding generous relative to population.',
  },
  {
    code: 'NT',
    name: 'Northern Territory',
    regulator: 'Northern Territory Electoral Commission',
    regulatorUrl: 'https://ntec.nt.gov.au/',
    disclosureThreshold: 1500,
    thresholdNote: 'Low threshold; aligned with ACT framework.',
    cadence: 'Annual',
    lagDescription: 'Annual returns filed 16 weeks after end of financial year.',
    realTime: false,
    indexed: false,
    notes: 'Smallest register by volume. Limited online searchability prior to 2023.',
  },
];

export const JURISDICTION_BY_CODE: Record<Jurisdiction['code'], Jurisdiction> = Object.fromEntries(
  JURISDICTIONS.map((j) => [j.code, j]),
) as Record<Jurisdiction['code'], Jurisdiction>;
