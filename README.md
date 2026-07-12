# Donations AU

**Search Australian political donations across federal and state disclosure registers.**

Live: [https://au-donations.benrichardson.dev](https://au-donations.benrichardson.dev)

## What is this?

Donations AU unifies Australia's nine political donation disclosure registers — the federal AEC Transparency Register plus six state and two territory regulators — into a single searchable interface.

Every Australian jurisdiction runs its own electoral-finance regime with different disclosure thresholds, different reporting cadences, and completely different data formats. The federal AEC publishes annual returns in February (eight months after the end of the financial year). Victoria has real-time disclosure with a 21-day window. Queensland has a $1,000 threshold and near-realtime updates. NSW and Queensland ban property developer donations at the state level. There is no official central register.

This site lets you search across all of them in one place, filter by donor type, jurisdiction, recipient party, or financial year, and explore aggregated views of the top donors, top recipients, totals by party, and totals by year.

## Who is this for?

Journalists chasing a political-finance story, researchers and policy analysts mapping donor networks, students of electoral law, and civic-minded citizens who want to follow the money in Australian politics without bouncing between seven different regulator portals.

## Data Sources

| Source                         | What it provides                                      | Update frequency        |
| ------------------------------ | ----------------------------------------------------- | ----------------------- |
| AEC Transparency Register      | Federal annual returns — **mirrored automatically**   | Annually (published February; site refreshes mid-March) |
| NSW Electoral Commission       | NSW donations (near-real-time during elections)       | Continuous              |
| Victorian Electoral Commission | Victorian donations (real-time, 21-day window)        | Real-time               |
| Electoral Commission Qld (ECQ) | Queensland donations (7-day disclosure)               | Real-time               |
| WA Electoral Commission        | WA donations                                          | Annual                  |
| ECSA (South Australia)         | SA donations                                          | Annual                  |
| Tasmanian Electoral Commission | Tasmanian donations                                   | Annual + event-triggered|
| Elections ACT, NTEC            | ACT & NT donations                                    | Quarterly / annual      |

**Note on data:** the two halves of the dataset have different provenance.

- **Federal (auto-refreshed yearly):** ~8,000 records mirrored from the AEC Transparency Register's bulk CSV export — donations reported by donors in their federal annual returns, covering the ten most recent financial years. The AEC publishes each February; a scheduled GitHub Actions pipeline ([data-pipeline.yml](.github/workflows/data-pipeline.yml) → [pipeline/collect.mjs](pipeline/collect.mjs)) re-downloads and normalizes the export every March. Individual dated payments are aggregated per financial year + donor + recipient; donor types are *inferred from donor names* (the register has no type field) and recipient names are mapped to parties by keyword.
- **State & territory (curated snapshot):** the eight state/territory registers publish no machine-readable bulk exports, so they cannot be mirrored. The site ships a hand-curated, **illustrative** sample of their disclosures (~60 records, lightly rounded) — not an exhaustive or live mirror.

For authoritative data, always consult the source registers.

## Features

- **Unified full-text search** across donor, recipient, donor type, and notes fields — tokens are AND-combined so `pratt labor` finds Pratt Holdings donations to Labor branches.
- **Multi-facet filter rail** — jurisdiction, recipient party, donor type, all with live counts per facet.
- **Sortable donation table** — every column sortable, sticky header, monospaced amounts, party pills, jurisdiction badges.
- **Top donors view** — bar chart of the 20 largest donors with per-party breakdown (so you can see who gives to both sides).
- **Top recipients view** — ranked totals by party branch and campaign entity.
- **Totals by party** — horizontal bar chart showing total disclosed amount received by each party across the filter scope.
- **Totals by year** — time-series showing the Clive-Palmer-driven election-cycle spikes in 2018-19 and 2021-22.
- **Jurisdiction comparison** — side-by-side cards for all 9 Australian disclosure regimes with thresholds, cadences, lag descriptions, and caveats.
- **Glossary tooltips** — click the `i` icons next to jargon terms (disclosure threshold, associated entity, aggregation, prohibited donor, etc.) for plain-language definitions.
- **About & Sources modal** — methodology, data provenance, and links to every authoritative register.
- **No cookies, no fingerprinting, no third-party fonts.** The only analytics is Cloudflare Web Analytics — anonymous, cookie-less page-view counts; no personal data, no cross-site tracking. Filter and tab state is persisted to localStorage only.

## Tech Stack

- **Runtime:** Vanilla TypeScript (no frameworks)
- **Build:** Vite 6
- **Testing:** Vitest + jsdom
- **Hosting:** GitHub Pages (static, no backend)
- **Data:** Federal records are fetched at runtime from `public/data/donations.json` (regenerated yearly from the AEC bulk export by `pipeline/collect.mjs`, zero dependencies); the state snapshot stays an embedded TypeScript module (`src/data/donations.ts`)

The production bundle is ~70KB JavaScript + ~17KB CSS, plus the federal dataset (~1.8MB JSON, ~135KB gzipped).

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview

# Refresh the federal dataset from the AEC bulk export
# (also run yearly by .github/workflows/data-pipeline.yml)
node pipeline/collect.mjs
```

## How it works

1. On page load, `src/main.ts` fetches the federal dataset from `/data/donations.json` (mirrored yearly from the AEC bulk export) and merges it with the embedded state-register snapshot (`STATE_DONATIONS_FILTERED`). If the fetch fails, the site still renders from the state snapshot with a visible notice.
2. The filter rail and search input drive a `FilterState` object; every input event re-runs `filterDonations()` (pure function, tested) and re-renders the active tab.
3. Each tab is a pure render function that takes the filtered donation array and returns an HTML string. The container is wiped and replaced on every render — no virtual DOM, no framework, no state diffing.
4. Filter state, active tab, and sort field/direction are persisted to `localStorage` under `au-donations:state-v1`.
5. Click-to-reveal glossary tooltips use event delegation at the document level so newly-rendered content Just Works without re-binding.

## License

MIT
