# Site Plan: Donations AU

## Overview
- **Name:** Donations AU
- **Repo name:** au-donations
- **Tagline:** Search Australian political donations across federal and state disclosure registers

## Target Audience
Australian journalists, political researchers, policy students, and civic-minded citizens who want to follow the money in Australian politics. The audience is non-technical but politically literate — they understand parties and elections but probably don't know what a "third party" is in electoral law or how AEC thresholds differ from state registers.

## Value Proposition
Every Australian donations register is siloed: the AEC publishes an annual dump federally, NSW has near-real-time disclosure, QLD publishes quarterly, and Victoria, WA, SA, Tasmania, ACT, and NT all use different formats, thresholds, and data shapes. There is no single searchable interface that unifies them into one queryable dataset. This site provides that: one search box, one filter panel, one table, across all jurisdictions — plus a clear side-by-side comparison of how each jurisdiction's disclosure regime actually works.

## Data Sources
| Source | URL | What it provides | Update frequency | Auth required? |
|--------|-----|-------------------|-----------------|----------------|
| AEC Transparency Register | https://transparency.aec.gov.au/ | Federal annual returns (donors, recipients, amounts) | Annually (Feb after FY) | No |
| NSW Electoral Commission Disclosures | https://www.elections.nsw.gov.au/funding-and-disclosure/disclosures | Near-real-time NSW donations | Continuous | No |
| VEC Donor Returns | https://www.vec.vic.gov.au/candidates-and-parties/donations | Victorian disclosures | Annually | No |
| ECQ Real-time Disclosure | https://disclosures.ecq.qld.gov.au/ | Queensland (real-time, $1 threshold) | Continuous | No |
| WAEC Disclosures | https://www.elections.wa.gov.au/elections/candidates-parties/disclosure | WA donations | Annually | No |
| ECSA Funding Disclosure | https://www.ecsa.sa.gov.au/elections/funding-and-disclosure | SA donations | Annually | No |
| TEC Election Returns | https://tec.tas.gov.au/ | Tasmanian disclosures | Annually | No |

**Data strategy:** Embedded curated snapshot. The site ships with a curated JSON dataset of ~300 real public donation records drawn from the above registers (recent disclosed years: 2022-23 and 2023-24). The About modal explains clearly that this is a curated snapshot for exploration, not an exhaustive or live mirror, and links out to the authoritative registers for definitive data.

## Key Features
1. **Unified search** — free-text search across donor, recipient, and notes fields with 300ms debounce.
2. **Multi-facet filters** — jurisdiction (federal/state), party, year, donor type (individual/corporation/union/associated entity), amount range.
3. **Sortable table** — every column sortable, sticky header, monospaced numbers, row detail on click.
4. **Aggregate views** — top donors, top recipients, totals by party, totals by year, totals by jurisdiction — switchable tabs.
5. **Jurisdiction comparison panel** — side-by-side table of thresholds, disclosure timelines, and data quality for all 7 Australian jurisdictions (federal + 6 states, plus ACT/NT).
6. **Interactive bar charts** — top-10 donors, top-10 recipients, annual totals — rendered as pure SVG.
7. **Glossary tooltips** — click-to-show definitions for electoral law jargon (associated entity, disclosure threshold, third party, in-kind donation, etc.).
8. **About modal** — full explanation of data sources, curation methodology, known limitations, and threshold caveats.

## Target Audience (detailed)
Mix of desktop and mobile users. Journalists researching a story will be on desktop, skimming the table for names they recognise. Concerned citizens after an election campaign ad might Google "who donates to [party]" on their phone. The emotional context is often distrust or frustration — people want a tool that respects their intelligence and doesn't hide data behind bureaucratic portals. They want to type a name and see everything. They are not tech-savvy, so the UI must not assume knowledge of "filtering" or "aggregation" — it must be explorable by clicking and typing.

## Style Direction
**Tone:** professional/civic — feels like a trustworthy public-interest tool, not a partisan or commercial product.
**Colour palette:** clean white background, dark navy primary text, teal accent (#0d6b82) for interactive elements, with soft amber for highlights and a restrained red/blue for party identifiers. Explicitly not using strong red/blue for the main UI because partisan overloading makes a data tool feel biased. Navy+teal is the Australian Bureau of Statistics / AEC style — authoritative and calm.
**UI density:** balanced — the table is data-dense but the page has breathing room. Panels have adequate whitespace. Not a terminal, not a consumer app.
**Dark/light theme:** **light** — this is a civic transparency tool for general audiences. A dark theme would feel conspiratorial and clash with the official registers it mirrors.
**Reference sites for tone:** abs.gov.au (clean, authoritative); opennem.org.au (data-dense but approachable); transparency.aec.gov.au (the source of truth we're making searchable).

## Technical Architecture
- **Stack:** Vanilla TypeScript + Vite (no React — a single-page tool with a search input, filter panel, and table does not need a component tree)
- **Data strategy:** embedded — curated `src/data/donations.ts` typed array, imported and indexed at startup
- **Key libraries:** none beyond Vite and Vitest — SVG charts hand-written, no Leaflet (no geographic map — jurisdictions are discrete, not geographic coordinates), no D3

## Layout
- **Fixed header (56px):** site name + tagline on left, "About" and "Glossary" buttons on right
- **Hero search band (96px):** big search input centred, one-line result count underneath
- **Filter rail (left, 240px on desktop):** collapses to top panel on mobile. Jurisdiction checkboxes, party checkboxes, year slider, donor-type checkboxes, amount range.
- **Main content (flex):**
  - **View tabs:** Table | Top Donors | Top Recipients | By Party | By Year | Jurisdictions
  - **Content panel:** the active view (table by default)
- **Sticky footer:** attribution + data source disclaimers

## Pages/Views
Single page, multiple tabs in the main content area:
1. **Table view** — all filtered donations as sortable rows (default)
2. **Top Donors view** — bar chart of top 15 donors by total contribution, with breakdown by party
3. **Top Recipients view** — bar chart of top 15 recipient parties/committees
4. **By Party view** — stacked bars showing total received per party across years
5. **By Year view** — time-series bars showing total disclosed amounts per year
6. **Jurisdictions view** — the 7-jurisdiction comparison table with thresholds, timelines, and links to authoritative sources
