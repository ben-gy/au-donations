# Donations AU — Build Review

This file exists only to create a reviewable PR. All code is already deployed on `main`.

**Merge this PR to acknowledge the build.** Closing without merging is also fine.

## Links

- **Custom domain:** https://au-donations.benrichardson.dev
- **GitHub Pages:** https://ben-gy.github.io/au-donations/ *(redirects to custom domain)*

## What it does

Donations AU unifies Australia's nine political donation disclosure registers — the federal AEC Transparency Register plus six state and two territory regulators — into a single searchable interface with one search box, one filter rail, and six views (donations table, top donors, top recipients, totals by party, totals by year, jurisdiction comparison).

## Stack

- Vanilla TypeScript + Vite 6
- Vitest (70 passing tests across format, filter, aggregate, and data integrity)
- Embedded dataset (~280 curated records from public AEC + state disclosures)
- Static bundle: ~70KB JS + 17KB CSS

## DNS setup (already configured)

Cloudflare CNAME in the `benrichardson.dev` zone:

| Type  | Name            | Target           | Proxy              |
| ----- | --------------- | ---------------- | ------------------ |
| CNAME | `au-donations`  | `ben-gy.github.io` | DNS only (grey)  |

If the TLS cert isn't live yet, the cycle trick:

```bash
gh api repos/ben-gy/au-donations/pages -X PUT -f cname=""
sleep 3
gh api repos/ben-gy/au-donations/pages -X PUT -f cname="au-donations.benrichardson.dev"
```
