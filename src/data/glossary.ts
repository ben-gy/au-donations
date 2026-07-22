// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// Plain-language definitions of electoral-finance jargon.
// Used by the click-to-reveal tooltip component in the UI.

export type GlossaryEntry = {
  term: string;
  short: string;
  long: string;
  source?: string;
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
  'disclosure-threshold': {
    term: 'Disclosure threshold',
    short: 'The minimum donation amount that must be publicly reported.',
    long: 'A disclosure threshold is the dollar amount below which donations do not need to be named in public returns. Donations below the threshold are legal but anonymous — they appear only as an aggregate total. Different jurisdictions set dramatically different thresholds: $16,900 federally (indexed annually), but only $1,000 in NSW and Queensland.',
    source: 'AEC Funding and Disclosure Handbook',
  },
  'associated-entity': {
    term: 'Associated entity',
    short: 'An organisation that operates wholly or partly for the benefit of a political party.',
    long: 'Associated entities are trusts, foundations, or companies that exist to channel funds into party coffers. The Cormack Foundation (Liberal) and the John Curtin House (Labor, historic) are classic examples. They must file their own returns with the AEC even though they are not political parties themselves.',
    source: 'Commonwealth Electoral Act 1918 s287',
  },
  'third-party': {
    term: 'Third party campaigner',
    short: 'A non-party organisation that spends on political campaigning above a threshold.',
    long: 'Third parties are advocacy groups, unions, lobby groups or industry bodies that spend more than a set amount on "electoral expenditure" during a period. Examples include Climate 200, Advance Aus, ACTU campaigns, and the Minerals Council. They must register and disclose their funders separately from party donations.',
    source: 'AEC',
  },
  'in-kind': {
    term: 'In-kind donation',
    short: 'A donation of goods or services rather than cash.',
    long: 'Free office space, donated polling, free legal services, discounted advertising, loaned staff — all count as in-kind donations and must be disclosed at their market value. In-kind giving is a common way large organisations support parties without writing a cheque.',
  },
  'receipt': {
    term: 'Receipt vs donation',
    short: 'Federally, returns report "receipts" — not just donations.',
    long: 'The AEC receives lists of total payments received by parties, which include both gifts and commercial income (ticket sales for events, subscription fees, investment returns). A "receipt" on the federal register is not necessarily a political donation — it may be a commercial payment. State registers tend to be stricter, reporting only true gifts.',
  },
  'aggregate': {
    term: 'Aggregation',
    short: 'Smaller donations from the same donor are combined for disclosure purposes.',
    long: 'To prevent threshold gaming, most jurisdictions require related donations from the same donor (e.g. $8,000 in March and $9,000 in June) to be summed and disclosed if the combined total exceeds the threshold. Aggregation also applies across related entities under common control.',
  },
  'prohibited-donor': {
    term: 'Prohibited donor',
    short: 'A person or company banned from making political donations.',
    long: 'NSW and Queensland prohibit property developers from donating to political parties, candidates, or councils. The ban covers both direct donations and indirect gifts routed through related entities. Breaches are a criminal offence.',
    source: 'NSW Electoral Funding Act 2018; Electoral Act 1992 (Qld)',
  },
  'foreign-donation': {
    term: 'Foreign donation',
    short: 'A donation from a person or entity outside Australia, now banned federally.',
    long: 'Since 2018, the Commonwealth bans foreign donations above $1,000 to political parties and election campaigns. The ban was introduced after revelations about Chinese-linked donations. State laws vary — Victoria bans foreign donations entirely.',
  },
  'party-id': {
    term: 'Political party',
    short: 'A registered political party eligible to nominate candidates.',
    long: 'Federal registration requires at least 1,500 members, a written constitution, and a name. Unregistered parties cannot appear on the federal ballot paper but may still contest elections as independents. State registrations are separate and thresholds vary.',
  },
  'financial-year': {
    term: 'Financial year',
    short: 'In Australia, 1 July to 30 June.',
    long: 'Federal political donation returns are organised around the Australian financial year. A "2023-24 return" covers gifts received between 1 July 2023 and 30 June 2024. Returns are published in early February the following year — so a donation made in July 2023 is not publicly disclosed until February 2025.',
  },
  'amount': {
    term: 'Amount',
    short: 'The dollar value of a single disclosed payment.',
    long: 'Amounts are reported in Australian dollars. In-kind gifts are reported at their market value. Aggregated figures may combine multiple smaller payments from the same donor within a financial year.',
  },
};

export const GLOSSARY_LIST: GlossaryEntry[] = Object.values(GLOSSARY).sort((a, b) =>
  a.term.localeCompare(b.term),
);
