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
| AEC Transparency Register      | Federal annual returns                                | Annually (February)     |
| NSW Electoral Commission       | NSW donations (near-real-time during elections)       | Continuous              |
| Victorian Electoral Commission | Victorian donations (real-time, 21-day window)        | Real-time               |
| Electoral Commission Qld (ECQ) | Queensland donations (7-day disclosure)               | Real-time               |
| WA Electoral Commission        | WA donations                                          | Annual                  |
| ECSA (South Australia)         | SA donations                                          | Annual                  |
| Tasmanian Electoral Commission | Tasmanian donations                                   | Annual + event-triggered|
| Elections ACT, NTEC            | ACT & NT donations                                    | Quarterly / annual      |

**Note on data:** This site ships with a curated snapshot of approximately 280 publicly disclosed donation records drawn from the sources above, covering recent financial years. Amounts reflect publicly reported figures and have been lightly rounded. The snapshot is **illustrative** — it is not an exhaustive or live mirror of every disclosure ever filed. For authoritative data, always consult the source registers.

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
- **No tracking, no analytics, no cookies, no third-party fonts.** Filter and tab state is persisted to localStorage only.

## Tech Stack

- **Runtime:** Vanilla TypeScript (no frameworks)
- **Build:** Vite 6
- **Testing:** Vitest + jsdom
- **Hosting:** GitHub Pages (static, no backend)
- **Data:** Embedded TypeScript module (`src/data/donations.ts`) — zero runtime fetching

The entire production bundle is ~70KB JavaScript + ~17KB CSS.

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests (70 tests)
npm test

# Production build
npm run build

# Preview production build
npm run preview
```

## How it works

1. On page load, `src/main.ts` imports the full donation dataset (`DONATIONS_FILTERED`) — it's a plain TypeScript array, so Vite bundles it directly into the JS artifact. No fetch calls, no network I/O.
2. The filter rail and search input drive a `FilterState` object; every input event re-runs `filterDonations()` (pure function, tested) and re-renders the active tab.
3. Each tab is a pure render function that takes the filtered donation array and returns an HTML string. The container is wiped and replaced on every render — no virtual DOM, no framework, no state diffing.
4. Filter state, active tab, and sort field/direction are persisted to `localStorage` under `au-donations:state-v1`.
5. Click-to-reveal glossary tooltips use event delegation at the document level so newly-rendered content Just Works without re-binding.

## License

MIT
