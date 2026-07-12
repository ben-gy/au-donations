import './styles.css';
import { STATE_DONATIONS_FILTERED, type Donation, type DonorType } from './data/donations';
import { loadFederalDonations, type FederalMeta } from './data/federal';
import { PARTIES, type PartyCode } from './data/parties';
import { JURISDICTIONS, JURISDICTION_BY_CODE, type Jurisdiction } from './data/jurisdictions';
import { GLOSSARY, GLOSSARY_LIST } from './data/glossary';
import { formatCurrency, formatNumber, fyLabel } from './utils/format';
import {
  defaultFilterState,
  filterDonations,
  sortDonations,
  type FilterState,
  type SortField,
  type SortDir,
} from './utils/filter';
import {
  topDonors,
  topRecipients,
  totalsByParty,
  totalsByYear,
  grandTotal,
  uniqueDonorCount,
} from './utils/aggregate';
import {
  ALL_SECTORS,
  SECTOR_COLORS,
  classifySector,
  computeFlows,
  buildNetwork,
  runForceSimulation,
  buildMatrix,
  type Sector,
  type NetworkNode,
} from './utils/sectors';
import { attachSvgZoom } from './utils/svgZoom';
import { initTooltip } from './utils/tooltip';

// ----------------------------------------------------------------------
// App state
// ----------------------------------------------------------------------

type TabId = 'table' | 'donors' | 'recipients' | 'parties' | 'years' | 'jurisdictions' | 'network' | 'flow' | 'matrix';

type AppState = {
  filters: FilterState;
  activeTab: TabId;
  sortField: SortField;
  sortDir: SortDir;
  sectorFilter: Sector | 'all';
};

const state: AppState = {
  filters: defaultFilterState(),
  activeTab: 'table',
  sortField: 'amount',
  sortDir: 'desc',
  sectorFilter: 'all',
};

// The working dataset: federal records fetched from public/data/donations.json
// (mirrored yearly from the AEC bulk export) plus the curated state-register
// snapshot. Populated during boot before the first render.
let ALL_DONATIONS: Donation[] = STATE_DONATIONS_FILTERED;
let federalMeta: FederalMeta | null = null;
let federalLoadFailed = false;

// Load saved filters from localStorage
try {
  const saved = localStorage.getItem('au-donations:state-v1');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.query) state.filters.query = parsed.query;
    if (Array.isArray(parsed.jurisdictions)) state.filters.jurisdictions = new Set(parsed.jurisdictions);
    if (Array.isArray(parsed.parties)) state.filters.parties = new Set(parsed.parties);
    if (Array.isArray(parsed.donorTypes)) state.filters.donorTypes = new Set(parsed.donorTypes);
    if (typeof parsed.activeTab === 'string') state.activeTab = parsed.activeTab;
    if (typeof parsed.sortField === 'string') state.sortField = parsed.sortField;
    if (typeof parsed.sortDir === 'string') state.sortDir = parsed.sortDir;
  }
} catch {
  /* ignore storage errors */
}

function persistState(): void {
  try {
    localStorage.setItem(
      'au-donations:state-v1',
      JSON.stringify({
        query: state.filters.query,
        jurisdictions: [...state.filters.jurisdictions],
        parties: [...state.filters.parties],
        donorTypes: [...state.filters.donorTypes],
        activeTab: state.activeTab,
        sortField: state.sortField,
        sortDir: state.sortDir,
      }),
    );
  } catch {
    /* ignore */
  }
}

// ----------------------------------------------------------------------
// Glossary tooltip — click-to-show, fixed-position popover
// ----------------------------------------------------------------------

let glossaryTooltipEl: HTMLDivElement | null = null;

function ensureGlossaryTooltip(): HTMLDivElement {
  if (glossaryTooltipEl) return glossaryTooltipEl;
  const el = document.createElement('div');
  el.className = 'glossary-tooltip';
  el.setAttribute('role', 'tooltip');
  document.body.appendChild(el);
  glossaryTooltipEl = el;
  return el;
}

function showGlossaryTooltip(anchor: HTMLElement, term: string): void {
  const entry = GLOSSARY[term];
  if (!entry) return;
  const tooltip = ensureGlossaryTooltip();
  tooltip.innerHTML = '';
  const h5 = document.createElement('h5');
  h5.textContent = entry.term;
  const pShort = document.createElement('p');
  pShort.className = 'short';
  pShort.textContent = entry.short;
  const pLong = document.createElement('p');
  pLong.textContent = entry.long;
  tooltip.appendChild(h5);
  tooltip.appendChild(pShort);
  tooltip.appendChild(pLong);
  if (entry.source) {
    const src = document.createElement('div');
    src.className = 'source';
    src.textContent = `Source: ${entry.source}`;
    tooltip.appendChild(src);
  }
  // Position near the anchor
  const rect = anchor.getBoundingClientRect();
  tooltip.classList.add('visible');
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let top = rect.bottom + 8;
  if (left + tooltipRect.width > window.innerWidth - 16) {
    left = window.innerWidth - tooltipRect.width - 16;
  }
  if (left < 16) left = 16;
  if (top + tooltipRect.height > window.innerHeight - 16) {
    top = rect.top - tooltipRect.height - 8;
  }
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideGlossaryTooltip(): void {
  if (glossaryTooltipEl) glossaryTooltipEl.classList.remove('visible');
}

// A small helper to create a glossary info icon inline.
function glossaryIcon(term: string): string {
  return `<span class="glossary-link" data-term="${term}" role="button" tabindex="0" aria-label="Definition of ${GLOSSARY[term]?.term ?? term}">i</span>`;
}

// ----------------------------------------------------------------------
// Modals
// ----------------------------------------------------------------------

function openModal(contentHtml: string): void {
  const backdrop = document.getElementById('modal-backdrop')!;
  const modal = backdrop.querySelector('.modal')!;
  modal.innerHTML = `<button class="modal-close" aria-label="Close">&times;</button>${contentHtml}`;
  backdrop.classList.add('visible');
  modal.querySelector<HTMLButtonElement>('.modal-close')?.addEventListener('click', closeModal);
}

function closeModal(): void {
  document.getElementById('modal-backdrop')?.classList.remove('visible');
}

function aboutModalHtml(): string {
  return `
    <h2>About Donations AU</h2>
    <p><strong>Donations AU</strong> is a unified searchable interface across Australia's political donation disclosure registers — the federal AEC Transparency Register plus the six state and two territory regulators.</p>
    <p>Every Australian jurisdiction runs its own electoral-finance regime with different ${glossaryIcon('disclosure-threshold')}disclosure thresholds, different reporting cadences, and different data formats. There is no official central register. This tool brings them together in one place so you can search across donors, recipient parties, jurisdictions, and years without juggling seven different portals.</p>

    <h3>Data sources</h3>
    <ul>
      <li><strong>Commonwealth (AEC):</strong> <a href="https://transparency.aec.gov.au/" target="_blank" rel="noopener noreferrer">transparency.aec.gov.au</a> — annual returns</li>
      <li><strong>NSW:</strong> <a href="https://www.elections.nsw.gov.au/funding-and-disclosure/disclosures" target="_blank" rel="noopener noreferrer">NSW Electoral Commission</a></li>
      <li><strong>Victoria:</strong> <a href="https://www.vec.vic.gov.au/candidates-and-parties/donations" target="_blank" rel="noopener noreferrer">VEC real-time disclosure register</a></li>
      <li><strong>Queensland:</strong> <a href="https://disclosures.ecq.qld.gov.au/" target="_blank" rel="noopener noreferrer">ECQ real-time disclosure system</a></li>
      <li><strong>Western Australia:</strong> <a href="https://www.elections.wa.gov.au/elections/candidates-parties/disclosure" target="_blank" rel="noopener noreferrer">WAEC</a></li>
      <li><strong>South Australia:</strong> <a href="https://www.ecsa.sa.gov.au/elections/funding-and-disclosure" target="_blank" rel="noopener noreferrer">ECSA</a></li>
      <li><strong>Tasmania:</strong> <a href="https://tec.tas.gov.au/" target="_blank" rel="noopener noreferrer">Tasmanian Electoral Commission</a></li>
      <li><strong>ACT &amp; NT:</strong> <a href="https://www.elections.act.gov.au/" target="_blank" rel="noopener noreferrer">Elections ACT</a>, <a href="https://ntec.nt.gov.au/" target="_blank" rel="noopener noreferrer">NTEC</a></li>
    </ul>

    <h3>About the data</h3>
    <p><strong>Federal (AEC):</strong> ${federalMeta ? `${formatNumber(federalMeta.recordCount)} records mirrored from the AEC Transparency Register bulk export — donations reported by donors in their federal annual returns, covering ${escapeHtml(federalMeta.financialYears[0] ?? '')} to ${escapeHtml(federalMeta.financialYears[federalMeta.financialYears.length - 1] ?? '')} (last refreshed ${escapeHtml(federalMeta.generatedAt.slice(0, 10))}).` : 'mirrored from the AEC Transparency Register bulk export.'} The AEC publishes annual returns each February; this site refreshes automatically every March. Individual dated payments are aggregated per financial year, donor, and recipient; donor types are <em>inferred from donor names</em> (the register carries no type field), and recipient names are mapped to parties by keyword.</p>
    <p><strong>State &amp; territory:</strong> a <strong>curated snapshot</strong> of ${STATE_DONATIONS_FILTERED.length} publicly disclosed records drawn from the eight state and territory registers. Those registers publish no machine-readable bulk exports, so they cannot be mirrored — this portion is illustrative only, with amounts lightly rounded, and is <em>not</em> an exhaustive or live mirror. For authoritative data, always consult the source registers.</p>

    <h3>Key caveats</h3>
    <ul>
      <li>Federal ${glossaryIcon('receipt')}"receipts" include commercial payments (ticket sales, subscriptions, investment income) alongside true gifts. State returns tend to report gifts only.</li>
      <li>Donations below each jurisdiction's ${glossaryIcon('disclosure-threshold')}disclosure threshold are legal but anonymous — they do not appear here at all.</li>
      <li>${glossaryIcon('aggregate')}Aggregated donations from related donors may appear under a parent entity name.</li>
      <li>Federal disclosure lags up to 20 months — a gift made in July 2024 is not publicly disclosed until February 2026.</li>
      <li>NSW, Victoria and Queensland prohibit ${glossaryIcon('prohibited-donor')}property developer donations at the state level, but the same developers may donate federally or in other states.</li>
    </ul>

    <h3>Who built this?</h3>
    <p>Built by <a href="https://benrichardson.dev/" target="_blank" rel="noopener noreferrer">benrichardson.dev</a> · <a href="https://sites.benrichardson.dev" target="_blank" rel="noopener">more tools &amp; sites</a>. Non-partisan, no tracking, no ads. Code is self-contained static HTML — you can archive this page for offline reference.</p>
  `;
}

function glossaryModalHtml(): string {
  const items = GLOSSARY_LIST.map(
    (entry) => `
    <div class="glossary-list-item">
      <h4>${entry.term}</h4>
      <p><strong>${entry.short}</strong></p>
      <p>${entry.long}</p>
      ${entry.source ? `<p class="source" style="font-size: var(--font-size-xs); color: var(--text-muted);">Source: ${entry.source}</p>` : ''}
    </div>
  `,
  ).join('');
  return `
    <h2>Glossary</h2>
    <p>Plain-language definitions of the terms used on this site and in the disclosure registers.</p>
    <div class="glossary-list">${items}</div>
  `;
}

// ----------------------------------------------------------------------
// Rendering — top-level shell
// ----------------------------------------------------------------------

function render(): void {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">
          <div class="brand-mark">$</div>
          <div class="brand-text">
            <div class="brand-title">Donations AU</div>
            <div class="brand-tagline">Australian political donations explorer</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="header-btn" id="btn-glossary">Glossary</button>
          <button class="header-btn primary" id="btn-about">About &amp; Sources</button>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="hero-inner">
        <h1>Follow the money in Australian politics</h1>
        <p>Search across federal and state donation registers — ${formatNumber(ALL_DONATIONS.length)} disclosed records from the AEC Transparency Register (refreshed yearly) plus a curated snapshot from the state and territory regulators. One search box, nine jurisdictions.</p>
        ${federalLoadFailed ? '<p class="data-notice">Federal register data failed to load — showing the curated state snapshot only. Try reloading the page.</p>' : ''}
        <div class="search-wrap">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input
            id="search-input"
            type="search"
            class="search-input"
            placeholder="Search donors, recipients, parties…"
            value="${escapeHtml(state.filters.query)}"
            autocomplete="off"
            aria-label="Search donations"
          />
        </div>
        <div class="result-summary" id="result-summary"></div>
      </div>
    </section>

    <main class="main-content">
      <aside class="filter-rail" id="filter-rail" aria-label="Filters"></aside>

      <section class="content-panel">
        <div class="tab-bar" role="tablist">
          <button class="tab-btn" data-tab="table" role="tab">Donations</button>
          <button class="tab-btn" data-tab="donors" role="tab">Top Donors</button>
          <button class="tab-btn" data-tab="recipients" role="tab">Top Recipients</button>
          <button class="tab-btn" data-tab="parties" role="tab">By Party</button>
          <button class="tab-btn" data-tab="years" role="tab">By Year</button>
          <button class="tab-btn" data-tab="network" role="tab">Relationship Map</button>
          <button class="tab-btn" data-tab="flow" role="tab">Money Flow</button>
          <button class="tab-btn" data-tab="matrix" role="tab">Cross-Reference</button>
          <button class="tab-btn" data-tab="jurisdictions" role="tab">Jurisdictions</button>
        </div>
        <div class="tab-content" id="tab-content"></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-col">
          <h5>About this site</h5>
          <p>Donations AU unifies Australia's federal and state political donation registers into one searchable interface. Federal records mirror the AEC Transparency Register bulk export and refresh yearly; state records are an illustrative curated snapshot. Consult the source registers for authoritative figures.</p>
          <p>Built by <a href="https://benrichardson.dev/">benrichardson.dev</a>. No cookies, no tracking — only anonymous, cookie-less page-view counts via Cloudflare Web Analytics.</p>
        </div>
        <div class="footer-col">
          <h5>Official registers</h5>
          <p>
            <a href="https://transparency.aec.gov.au/" target="_blank" rel="noopener noreferrer">AEC Transparency Register</a> &middot;
            <a href="https://www.vec.vic.gov.au/candidates-and-parties/donations" target="_blank" rel="noopener noreferrer">VEC</a> &middot;
            <a href="https://disclosures.ecq.qld.gov.au/" target="_blank" rel="noopener noreferrer">ECQ</a> &middot;
            <a href="https://www.elections.nsw.gov.au/funding-and-disclosure/disclosures" target="_blank" rel="noopener noreferrer">NSWEC</a>
          </p>
          <small>This site is non-partisan and not affiliated with any political party, regulator, or government agency.</small>
        </div>
      </div>
    </footer>

    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true"></div>
    </div>
  `;
  renderFilterRail();
  renderTabContent();
  attachHandlers();
  updateTabButtons();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ----------------------------------------------------------------------
// Filter rail
// ----------------------------------------------------------------------

function renderFilterRail(): void {
  const rail = document.getElementById('filter-rail')!;
  // Count donations per facet for the "count" badges
  const jurisdictionCounts = new Map<string, number>();
  const partyCounts = new Map<string, number>();
  const donorTypeCounts = new Map<string, number>();
  for (const d of ALL_DONATIONS) {
    jurisdictionCounts.set(d.jurisdiction, (jurisdictionCounts.get(d.jurisdiction) ?? 0) + 1);
    partyCounts.set(d.recipientParty, (partyCounts.get(d.recipientParty) ?? 0) + 1);
    donorTypeCounts.set(d.donorType, (donorTypeCounts.get(d.donorType) ?? 0) + 1);
  }

  const jurisdictionCheckboxes = JURISDICTIONS.map((j) => {
    const checked = state.filters.jurisdictions.has(j.code);
    const count = jurisdictionCounts.get(j.code) ?? 0;
    return `
      <label>
        <input type="checkbox" data-facet="jurisdiction" value="${j.code}" ${checked ? 'checked' : ''}/>
        <span>${j.code}</span>
        <span class="count">${count}</span>
      </label>
    `;
  }).join('');

  const partyOrder: PartyCode[] = ['ALP', 'LIB', 'NAT', 'LNP', 'GRN', 'UAP', 'ONP', 'CA', 'IND', 'KAP', 'JLN', 'SFF', 'OTH'];
  const partyCheckboxes = partyOrder
    .filter((code) => (partyCounts.get(code) ?? 0) > 0)
    .map((code) => {
      const party = PARTIES[code];
      const checked = state.filters.parties.has(code);
      const count = partyCounts.get(code) ?? 0;
      return `
        <label>
          <input type="checkbox" data-facet="party" value="${code}" ${checked ? 'checked' : ''}/>
          <span class="party-swatch" style="background:${party.colour}"></span>
          <span>${party.shortName}</span>
          <span class="count">${count}</span>
        </label>
      `;
    })
    .join('');

  const donorTypes: DonorType[] = ['Individual', 'Corporation', 'Union', 'Associated entity', 'Foundation', 'Industry body', 'Third party'];
  const donorTypeCheckboxes = donorTypes
    .filter((t) => (donorTypeCounts.get(t) ?? 0) > 0)
    .map((t) => {
      const checked = state.filters.donorTypes.has(t);
      const count = donorTypeCounts.get(t) ?? 0;
      return `
        <label>
          <input type="checkbox" data-facet="donorType" value="${t}" ${checked ? 'checked' : ''}/>
          <span>${t}</span>
          <span class="count">${count}</span>
        </label>
      `;
    })
    .join('');

  rail.innerHTML = `
    <div class="filter-group">
      <h3>Jurisdiction ${glossaryIcon('disclosure-threshold')}</h3>
      ${jurisdictionCheckboxes}
    </div>
    <div class="filter-group">
      <h3>Recipient party</h3>
      ${partyCheckboxes}
    </div>
    <div class="filter-group">
      <h3>Donor type ${glossaryIcon('associated-entity')}</h3>
      ${donorTypeCheckboxes}
    </div>
    <button class="filter-clear" id="filter-clear">Clear all filters</button>
  `;
}

// ----------------------------------------------------------------------
// Tab content
// ----------------------------------------------------------------------

function getFilteredDonations(): Donation[] {
  return filterDonations(ALL_DONATIONS, state.filters);
}

function updateResultSummary(filtered: Donation[]): void {
  const summary = document.getElementById('result-summary');
  if (!summary) return;
  const total = grandTotal(filtered);
  const donors = uniqueDonorCount(filtered);
  summary.innerHTML = `
    Showing <strong>${formatNumber(filtered.length)}</strong> of ${formatNumber(ALL_DONATIONS.length)} records &middot;
    <strong>${formatCurrency(total, { compact: true })}</strong> total disclosed &middot;
    <strong>${formatNumber(donors)}</strong> unique donors
  `;
}

function renderTabContent(): void {
  const container = document.getElementById('tab-content')!;
  const filtered = getFilteredDonations();
  updateResultSummary(filtered);

  switch (state.activeTab) {
    case 'table':
      container.innerHTML = renderTableView(filtered);
      attachTableHandlers();
      break;
    case 'donors':
      container.innerHTML = renderTopDonorsView(filtered);
      break;
    case 'recipients':
      container.innerHTML = renderTopRecipientsView(filtered);
      break;
    case 'parties':
      container.innerHTML = renderPartiesView(filtered);
      break;
    case 'years':
      container.innerHTML = renderYearsView(filtered);
      break;
    case 'network':
      container.innerHTML = renderNetworkView(filtered);
      attachNetworkHandlers(filtered);
      break;
    case 'flow':
      container.innerHTML = renderFlowView(filtered);
      attachFlowHandlers();
      break;
    case 'matrix':
      container.innerHTML = renderMatrixView(filtered);
      attachMatrixHandlers();
      break;
    case 'jurisdictions':
      container.innerHTML = renderJurisdictionsView();
      break;
  }
}

function updateTabButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });
}

// ----------------------------------------------------------------------
// Table view
// ----------------------------------------------------------------------

function renderTableView(filtered: Donation[]): string {
  if (filtered.length === 0) {
    return `
      <div class="empty-state">
        <h4>No matching donations</h4>
        <p>Try clearing a filter or broadening your search term.</p>
      </div>
    `;
  }
  const sorted = sortDonations(filtered, state.sortField, state.sortDir);
  const visible = sorted.slice(0, 500);

  const headerCell = (field: SortField, label: string, align: 'left' | 'right' = 'left'): string => {
    const isSorted = state.sortField === field;
    const arrow = isSorted ? (state.sortDir === 'asc' ? ' \u2191' : ' \u2193') : '';
    return `<th class="${align === 'right' ? 'amount' : ''} ${isSorted ? 'sorted' : ''}" data-sort="${field}">${label}${arrow}</th>`;
  };

  const rows = visible
    .map((d) => {
      const party = PARTIES[d.recipientParty];
      const jurisdictionName = JURISDICTION_BY_CODE[d.jurisdiction]?.name ?? d.jurisdiction;
      return `
      <tr>
        <td>
          <div class="donor-cell">
            <strong>${escapeHtml(d.donor)}</strong>
            <small>${escapeHtml(d.donorType)}${d.category !== 'Cash' ? ' &middot; ' + escapeHtml(d.category) : ''}</small>
          </div>
        </td>
        <td>
          <div>${escapeHtml(d.recipient)}</div>
          <span class="party-pill" style="background:${party?.colour ?? '#6b7280'}">${escapeHtml(party?.shortName ?? d.recipientParty)}</span>
        </td>
        <td><span class="jurisdiction-pill" data-tip="${escapeHtml(jurisdictionName)}" aria-label="${escapeHtml(jurisdictionName)}">${escapeHtml(d.jurisdiction)}</span></td>
        <td class="fy-cell">${escapeHtml(fyLabel(d.fy))}</td>
        <td class="amount">${formatCurrency(d.amount)}</td>
      </tr>
    `;
    })
    .join('');

  const truncatedNote =
    sorted.length > visible.length
      ? `<div style="padding: var(--space-md); font-size: var(--font-size-xs); color: var(--text-tertiary); text-align: center;">Showing first ${visible.length} of ${sorted.length} matching records. Apply filters to narrow the view.</div>`
      : '';

  return `
    <div class="donation-table-wrap">
      <table class="donation-table">
        <thead>
          <tr>
            ${headerCell('donor', 'Donor')}
            ${headerCell('recipient', 'Recipient')}
            ${headerCell('jurisdiction', 'Jurisdiction')}
            ${headerCell('fy', 'FY')}
            ${headerCell('amount', 'Amount', 'right')}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${truncatedNote}
    </div>
  `;
}

function attachTableHandlers(): void {
  document.querySelectorAll<HTMLTableCellElement>('.donation-table th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort as SortField;
      if (state.sortField === field) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = field;
        state.sortDir = field === 'amount' ? 'desc' : 'asc';
      }
      persistState();
      renderTabContent();
    });
  });
}

// ----------------------------------------------------------------------
// Top donors / recipients
// ----------------------------------------------------------------------

function renderTopDonorsView(filtered: Donation[]): string {
  const tops = topDonors(filtered, 20);
  if (tops.length === 0) return emptyState();
  const max = tops[0].total;
  const bars = tops
    .map((entry) => {
      const partyEntries = Object.entries(entry.byParty) as Array<[PartyCode, number]>;
      const segments = partyEntries
        .sort((a, b) => b[1] - a[1])
        .map(([code, amount]) => {
          const party = PARTIES[code];
          const pct = (amount / max) * 100;
          const tip = `${party.shortName}: ${formatCurrency(amount)}`;
          return `<div class="bar-fill" style="width:${pct}%; background:${party.colour}" data-tip="${escapeHtml(tip)}" aria-label="${escapeHtml(tip)}"></div>`;
        })
        .join('');
      return `
        <div class="bar-row">
          <div class="label" data-tip="${escapeHtml(entry.name)}" aria-label="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
          <div class="bar-track">${segments}</div>
          <div class="value">${formatCurrency(entry.total, { compact: true })}</div>
        </div>
      `;
    })
    .join('');

  return `
    <h3 class="section-title">Top 20 donors</h3>
    <p class="section-subtitle">Ranked by total disclosed amount. Bar segments show split between recipient parties.</p>
    <div class="chart-grid">${bars}</div>
    ${partyLegend(tops.flatMap((e) => Object.keys(e.byParty)) as PartyCode[])}
  `;
}

function renderTopRecipientsView(filtered: Donation[]): string {
  const tops = topRecipients(filtered, 20);
  if (tops.length === 0) return emptyState();
  const max = tops[0].total;
  const bars = tops
    .map((entry) => {
      const code = Object.keys(entry.byParty)[0] as PartyCode;
      const party = PARTIES[code];
      const pct = (entry.total / max) * 100;
      const barTip = `${party?.shortName ?? code}: ${formatCurrency(entry.total)}`;
      return `
        <div class="bar-row">
          <div class="label" data-tip="${escapeHtml(entry.name)}" aria-label="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${party?.colour ?? '#6b7280'}" data-tip="${escapeHtml(barTip)}" aria-label="${escapeHtml(barTip)}"></div></div>
          <div class="value">${formatCurrency(entry.total, { compact: true })}</div>
        </div>
      `;
    })
    .join('');

  return `
    <h3 class="section-title">Top 20 recipients</h3>
    <p class="section-subtitle">Party branches and campaign entities ranked by total disclosed amount received.</p>
    <div class="chart-grid">${bars}</div>
  `;
}

// ----------------------------------------------------------------------
// Parties view (horizontal bar chart)
// ----------------------------------------------------------------------

function renderPartiesView(filtered: Donation[]): string {
  const totals = totalsByParty(filtered);
  if (totals.length === 0) return emptyState();
  const max = totals[0].total;
  const bars = totals
    .map((entry) => {
      const party = PARTIES[entry.party];
      const pct = (entry.total / max) * 100;
      return `
        <div class="bar-row">
          <div class="label"><span class="party-swatch" style="background:${party.colour}"></span>${escapeHtml(party.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${party.colour}"></div></div>
          <div class="value">${formatCurrency(entry.total, { compact: true })}</div>
        </div>
      `;
    })
    .join('');

  return `
    <h3 class="section-title">Totals by recipient party</h3>
    <p class="section-subtitle">Aggregated across all jurisdictions and years in the current filter. Note that the United Australia Party's total is dominated by a single donor (Clive Palmer's Mineralogy).</p>
    <div class="chart-grid">${bars}</div>
  `;
}

// ----------------------------------------------------------------------
// Years view
// ----------------------------------------------------------------------

function renderYearsView(filtered: Donation[]): string {
  const totals = totalsByYear(filtered);
  if (totals.length === 0) return emptyState();
  const max = Math.max(...totals.map((t) => t.total));
  const bars = totals
    .map((entry) => {
      const partyEntries = Object.entries(entry.byParty) as Array<[PartyCode, number]>;
      const segments = partyEntries
        .sort((a, b) => b[1] - a[1])
        .map(([code, amount]) => {
          const party = PARTIES[code];
          const pct = (amount / max) * 100;
          const tip = `${party.shortName}: ${formatCurrency(amount)}`;
          return `<div class="bar-fill" style="width:${pct}%; background:${party.colour}" data-tip="${escapeHtml(tip)}" aria-label="${escapeHtml(tip)}"></div>`;
        })
        .join('');
      return `
        <div class="bar-row">
          <div class="label">${escapeHtml(fyLabel(entry.fy))}</div>
          <div class="bar-track">${segments}</div>
          <div class="value">${formatCurrency(entry.total, { compact: true })}</div>
        </div>
      `;
    })
    .join('');

  return `
    <h3 class="section-title">Disclosed donations by financial year ${glossaryIcon('financial-year')}</h3>
    <p class="section-subtitle">Australian financial year runs 1 July to 30 June. Federal returns are not published until the following February. Election-cycle spikes reflect Clive Palmer's UAP spending in 2018-19 and 2021-22.</p>
    <div class="chart-grid">${bars}</div>
    ${partyLegend(totals.flatMap((t) => Object.keys(t.byParty)) as PartyCode[])}
  `;
}

// ----------------------------------------------------------------------
// Jurisdictions view
// ----------------------------------------------------------------------

function renderJurisdictionsView(): string {
  const cards = JURISDICTIONS.map((j: Jurisdiction) => {
    const badge = j.realTime
      ? '<span class="badge-realtime">Real-time</span>'
      : j.cadence === 'Annual'
      ? '<span class="badge-annual">Annual</span>'
      : `<span class="badge-annual" style="background: var(--status-info)">${j.cadence}</span>`;
    return `
      <div class="jurisdiction-card">
        <h4>
          <span class="jurisdiction-code">${j.code}</span>
          ${escapeHtml(j.name)}
          ${badge}
        </h4>
        <div class="row">
          <span class="k">Regulator</span>
          <span class="v">${escapeHtml(j.regulator)}</span>
        </div>
        <div class="row">
          <span class="k">${glossaryIcon('disclosure-threshold')}Threshold</span>
          <span class="v mono">${formatCurrency(j.disclosureThreshold)}${j.indexed ? ' *' : ''}</span>
        </div>
        <div class="row">
          <span class="k">Cadence</span>
          <span class="v">${escapeHtml(j.cadence)}</span>
        </div>
        <div class="row">
          <span class="k">Disclosure lag</span>
          <span class="v">${escapeHtml(j.lagDescription)}</span>
        </div>
        <div class="note">${escapeHtml(j.notes)}</div>
        <div class="source"><a href="${j.regulatorUrl}" target="_blank" rel="noopener noreferrer">Official register &rarr;</a></div>
      </div>
    `;
  }).join('');

  return `
    <h3 class="section-title">Australia's 9 political donation regimes</h3>
    <p class="section-subtitle">Every jurisdiction runs its own disclosure framework with different thresholds, reporting cadences, and caveats. The Commonwealth regime is the most permissive; Victoria is the strictest. Starred thresholds are indexed annually to CPI.</p>
    <div class="jurisdictions-grid">${cards}</div>
  `;
}

// ----------------------------------------------------------------------
// Network graph view (relationship map)
// ----------------------------------------------------------------------

function renderNetworkView(filtered: Donation[]): string {
  if (filtered.length === 0) return emptyState();

  const sectorOptions = ALL_SECTORS.map(
    (s) => `<option value="${s}" ${state.sectorFilter === s ? 'selected' : ''}>${s}</option>`,
  ).join('');

  return `
    <h3 class="section-title">Donor–Party relationship map</h3>
    <p class="section-subtitle">
      Explore how donors connect to recipient parties. Donors are on the left, parties on the right.
      Line thickness is proportional to donation amount. Node size represents total disclosed value.
      Filter by industry sector to isolate clusters — for example, see all mining companies and their party connections.
    </p>
    <div class="network-controls">
      <label for="sector-filter">Filter by sector:</label>
      <select id="sector-filter" class="sector-select">
        <option value="all" ${state.sectorFilter === 'all' ? 'selected' : ''}>All sectors</option>
        ${sectorOptions}
      </select>
      <span class="network-hint">Hover over a node to highlight its connections</span>
    </div>
    <div class="network-canvas-wrap">
      <svg id="network-svg" class="network-svg" viewBox="-600 -450 1200 900" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
    <div class="legend network-legend" id="network-legend"></div>
  `;
}

function attachNetworkHandlers(filtered: Donation[]): void {
  // Build and simulate network
  const sectorFiltered =
    state.sectorFilter === 'all'
      ? filtered
      : filtered.filter((d) => classifySector(d) === state.sectorFilter);

  const { nodes, edges, totalDonorCount } = buildNetwork(sectorFiltered);
  runForceSimulation(nodes, edges, 200);

  const donorNodeCount = nodes.filter((n) => n.type === 'donor').length;
  const hint = document.querySelector('.network-hint');
  if (hint && donorNodeCount < totalDonorCount) {
    hint.textContent = `Showing the top ${formatNumber(donorNodeCount)} of ${formatNumber(totalDonorCount)} donors by total — hover over a node to highlight its connections`;
  }

  const svg = document.getElementById('network-svg')!;
  const nodeIndex = new Map<string, NetworkNode>();
  for (const n of nodes) nodeIndex.set(n.id, n);

  // Draw edges
  const maxEdge = Math.max(...edges.map((e) => e.amount), 1);
  const edgeEls: SVGPathElement[] = [];
  for (const edge of edges) {
    const src = nodeIndex.get(edge.sourceId);
    const tgt = nodeIndex.get(edge.targetId);
    if (!src || !tgt) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const cx = (src.x + tgt.x) / 2;
    const d = `M ${src.x} ${src.y} Q ${cx} ${src.y} ${cx} ${(src.y + tgt.y) / 2} Q ${cx} ${tgt.y} ${tgt.x} ${tgt.y}`;
    path.setAttribute('d', d);
    const width = 0.5 + 4 * Math.sqrt(edge.amount / maxEdge);
    const opacity = 0.12 + 0.35 * Math.sqrt(edge.amount / maxEdge);
    path.setAttribute('stroke', '#94a3b8');
    path.setAttribute('stroke-width', String(width));
    path.setAttribute('stroke-opacity', String(opacity));
    path.setAttribute('fill', 'none');
    path.dataset.source = edge.sourceId;
    path.dataset.target = edge.targetId;
    path.classList.add('network-edge');
    svg.appendChild(path);
    edgeEls.push(path);
  }

  // Draw nodes
  const nodeEls: SVGGElement[] = [];
  for (const node of nodes) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('network-node');
    g.dataset.nodeId = node.id;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(node.x));
    circle.setAttribute('cy', String(node.y));
    circle.setAttribute('r', String(node.radius));

    if (node.type === 'donor') {
      const color = SECTOR_COLORS[node.sector!] ?? '#6b7280';
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.85');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '1.5');
    } else {
      const party = PARTIES[node.partyCode as PartyCode];
      circle.setAttribute('fill', party?.colour ?? '#6b7280');
      circle.setAttribute('fill-opacity', '0.9');
      circle.setAttribute('stroke', party?.colour ?? '#6b7280');
      circle.setAttribute('stroke-width', '2');
    }
    g.appendChild(circle);

    // Label for recipient nodes and large donors
    if (node.type === 'recipient' || node.radius > 10) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(node.x + (node.type === 'recipient' ? node.radius + 6 : -node.radius - 6)));
      text.setAttribute('y', String(node.y + 4));
      text.setAttribute('text-anchor', node.type === 'recipient' ? 'start' : 'end');
      text.setAttribute('font-size', node.type === 'recipient' ? '13' : '10');
      text.setAttribute('font-weight', node.type === 'recipient' ? '700' : '500');
      text.setAttribute('fill', 'var(--text-primary)');
      text.setAttribute('pointer-events', 'none');
      const label = node.type === 'recipient' ? (PARTIES[node.partyCode as PartyCode]?.shortName ?? node.label) : node.label;
      text.textContent = label.length > 28 ? label.slice(0, 27) + '\u2026' : label;
      g.appendChild(text);
    }
    svg.appendChild(g);
    nodeEls.push(g);
  }

  // Interaction: hover to highlight
  const tooltip = ensureGlossaryTooltip(); // reuse the existing tooltip div
  for (const g of nodeEls) {
    g.addEventListener('mouseenter', () => {
      const id = g.dataset.nodeId!;
      const node = nodeIndex.get(id)!;
      // Dim all edges, highlight connected
      for (const path of edgeEls) {
        const connected = path.dataset.source === id || path.dataset.target === id;
        path.setAttribute('stroke-opacity', connected ? '0.8' : '0.03');
        path.setAttribute('stroke', connected ? (node.type === 'donor' ? SECTOR_COLORS[node.sector!] ?? '#475569' : PARTIES[node.partyCode as PartyCode]?.colour ?? '#475569') : '#94a3b8');
      }
      // Show tooltip
      const rect = (g.querySelector('circle') as SVGCircleElement).getBoundingClientRect();
      tooltip.innerHTML = `
        <h5>${escapeHtml(node.label)}</h5>
        <p class="short">${node.type === 'donor' ? escapeHtml(node.sector ?? '') : escapeHtml(PARTIES[node.partyCode as PartyCode]?.name ?? '')}</p>
        <p>Total: <strong>${formatCurrency(node.total, { compact: true })}</strong></p>
      `;
      tooltip.classList.add('visible');
      tooltip.style.left = `${rect.left + rect.width / 2 - 120}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
    });
    g.addEventListener('mouseleave', () => {
      for (const path of edgeEls) {
        const edge = edges.find((e) => e.sourceId === path.dataset.source && e.targetId === path.dataset.target);
        const opacity = edge ? 0.12 + 0.35 * Math.sqrt(edge.amount / maxEdge) : 0.15;
        path.setAttribute('stroke-opacity', String(opacity));
        path.setAttribute('stroke', '#94a3b8');
      }
      tooltip.classList.remove('visible');
    });
  }

  // Sector filter handler. renderTabContent() re-invokes attachNetworkHandlers
  // for the network tab, so we must NOT call it again here — doing so would
  // draw a second overlaid graph and append a duplicate set of zoom controls.
  const select = document.getElementById('sector-filter') as HTMLSelectElement | null;
  select?.addEventListener('change', () => {
    state.sectorFilter = select.value as Sector | 'all';
    renderTabContent();
  });

  // Build legend
  const legendEl = document.getElementById('network-legend')!;
  const sectorItems = ALL_SECTORS
    .filter((s) => nodes.some((n) => n.sector === s))
    .map((s) => `<span><span class="party-swatch" style="background:${SECTOR_COLORS[s]}"></span>${s}</span>`)
    .join('');
  const partyItems = nodes
    .filter((n) => n.type === 'recipient')
    .map((n) => {
      const p = PARTIES[n.partyCode as PartyCode];
      return p ? `<span><span class="party-swatch" style="background:${p.colour}"></span>${p.shortName}</span>` : '';
    })
    .join('');
  legendEl.innerHTML = `<div style="margin-bottom:var(--space-sm);font-weight:600;font-size:var(--font-size-xs);color:var(--text-tertiary)">SECTORS (donors)</div>${sectorItems}<div style="margin-top:var(--space-md);margin-bottom:var(--space-sm);font-weight:600;font-size:var(--font-size-xs);color:var(--text-tertiary)">PARTIES (recipients)</div>${partyItems}`;

  // Wheel-zoom + drag-pan for the dense graph. The copied svgZoom util defers
  // pointer capture until a real >4px drag, so the per-node mouseenter/mouseleave
  // handlers wired above keep firing on hover and a plain click still reaches
  // child nodes.
  attachSvgZoom(svg as unknown as SVGSVGElement);
}

// ----------------------------------------------------------------------
// Flow view (Sankey-style sector → party)
// ----------------------------------------------------------------------

function renderFlowView(filtered: Donation[]): string {
  if (filtered.length === 0) return emptyState();

  const flows = computeFlows(filtered);
  if (flows.length === 0) return emptyState();

  // Collect all parties that receive donations
  const partyTotals = new Map<string, number>();
  for (const sf of flows) {
    for (const f of sf.flows) {
      partyTotals.set(f.partyCode, (partyTotals.get(f.partyCode) ?? 0) + f.amount);
    }
  }
  const partiesSorted = [...partyTotals.entries()].sort((a, b) => b[1] - a[1]);

  const svgW = 900;
  const svgH = Math.max(500, flows.length * 42, partiesSorted.length * 50);
  const leftX = 200;
  const rightX = svgW - 200;

  // Compute Y positions for sectors (left)
  const totalAll = flows.reduce((s, f) => s + f.total, 0);
  let sectorY = 30;
  const sectorPositions: Array<{ sector: Sector; y: number; h: number; total: number }> = [];
  for (const sf of flows) {
    const h = Math.max(18, (sf.total / totalAll) * (svgH - 60));
    sectorPositions.push({ sector: sf.sector, y: sectorY, h, total: sf.total });
    sectorY += h + 4;
  }

  // Compute Y positions for parties (right)
  const partyAll = partiesSorted.reduce((s, [, v]) => s + v, 0);
  let partyY = 30;
  const partyPositions: Array<{ code: string; y: number; h: number; total: number }> = [];
  for (const [code, total] of partiesSorted) {
    const h = Math.max(18, (total / partyAll) * (svgH - 60));
    partyPositions.push({ code, y: partyY, h, total });
    partyY += h + 4;
  }

  // Draw paths sector → party
  let pathsSvg = '';
  for (let si = 0; si < flows.length; si++) {
    const sf = flows[si];
    const sp = sectorPositions[si];
    let sOffset = 0;
    for (const f of sf.flows) {
      const pp = partyPositions.find((p) => p.code === f.partyCode);
      if (!pp) continue;
      const party = PARTIES[f.partyCode as PartyCode];
      const flowH = Math.max(1, (f.amount / totalAll) * (svgH - 60));
      const srcY = sp.y + sOffset + flowH / 2;
      const tgtY = pp.y + pp.h / 2;
      const cx1 = leftX + (rightX - leftX) * 0.35;
      const cx2 = leftX + (rightX - leftX) * 0.65;
      pathsSvg += `<path d="M ${leftX} ${srcY} C ${cx1} ${srcY}, ${cx2} ${tgtY}, ${rightX} ${tgtY}"
        fill="none" stroke="${party?.colour ?? '#6b7280'}" stroke-width="${flowH}"
        stroke-opacity="0.25" class="flow-path"
        data-sector="${escapeHtml(sf.sector)}" data-party="${f.partyCode}"
        data-amount="${f.amount}" />`;
      sOffset += flowH;
    }
  }

  // Draw sector labels (left)
  let sectorLabelsSvg = '';
  for (const sp of sectorPositions) {
    const color = SECTOR_COLORS[sp.sector];
    sectorLabelsSvg += `<rect x="${leftX - 8}" y="${sp.y}" width="8" height="${sp.h}" rx="2" fill="${color}" />`;
    sectorLabelsSvg += `<text x="${leftX - 14}" y="${sp.y + sp.h / 2 + 4}" text-anchor="end" font-size="11" font-weight="500" fill="var(--text-primary)">${escapeHtml(sp.sector)}</text>`;
    sectorLabelsSvg += `<text x="${leftX - 14}" y="${sp.y + sp.h / 2 + 16}" text-anchor="end" font-size="9" fill="var(--text-tertiary)">${formatCurrency(sp.total, { compact: true })}</text>`;
  }

  // Draw party labels (right)
  let partyLabelsSvg = '';
  for (const pp of partyPositions) {
    const party = PARTIES[pp.code as PartyCode];
    partyLabelsSvg += `<rect x="${rightX}" y="${pp.y}" width="8" height="${pp.h}" rx="2" fill="${party?.colour ?? '#6b7280'}" />`;
    partyLabelsSvg += `<text x="${rightX + 14}" y="${pp.y + pp.h / 2 + 4}" text-anchor="start" font-size="11" font-weight="500" fill="var(--text-primary)">${escapeHtml(party?.shortName ?? pp.code)}</text>`;
    partyLabelsSvg += `<text x="${rightX + 14}" y="${pp.y + pp.h / 2 + 16}" text-anchor="start" font-size="9" fill="var(--text-tertiary)">${formatCurrency(pp.total, { compact: true })}</text>`;
  }

  return `
    <h3 class="section-title">Money flow: sectors to parties</h3>
    <p class="section-subtitle">
      How money flows from industry sectors to political parties. Width of each flow is proportional to total disclosed amount.
      Hover over a flow to see the exact amount. Colour follows the recipient party.
    </p>
    <div class="flow-svg-wrap">
      <svg id="flow-svg" class="flow-svg" viewBox="0 0 ${svgW} ${svgH + 40}" preserveAspectRatio="xMidYMid meet">
        ${pathsSvg}
        ${sectorLabelsSvg}
        ${partyLabelsSvg}
      </svg>
    </div>
    <div id="flow-tooltip" class="flow-tooltip"></div>
  `;
}

function attachFlowHandlers(): void {
  const tooltip = document.getElementById('flow-tooltip')!;
  document.querySelectorAll<SVGPathElement>('.flow-path').forEach((path) => {
    path.addEventListener('mouseenter', (e) => {
      path.setAttribute('stroke-opacity', '0.65');
      const sector = path.dataset.sector ?? '';
      const partyCode = path.dataset.party ?? '';
      const amount = Number(path.dataset.amount);
      const party = PARTIES[partyCode as PartyCode];
      tooltip.innerHTML = `<strong>${escapeHtml(sector)}</strong> &rarr; <strong>${escapeHtml(party?.shortName ?? partyCode)}</strong><br>${formatCurrency(amount)}`;
      tooltip.style.display = 'block';
      tooltip.style.left = `${(e as MouseEvent).clientX + 12}px`;
      tooltip.style.top = `${(e as MouseEvent).clientY - 20}px`;
    });
    path.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${(e as MouseEvent).clientX + 12}px`;
      tooltip.style.top = `${(e as MouseEvent).clientY - 20}px`;
    });
    path.addEventListener('mouseleave', () => {
      path.setAttribute('stroke-opacity', '0.25');
      tooltip.style.display = 'none';
    });
  });
}

// ----------------------------------------------------------------------
// Matrix view (donor × party heatmap)
// ----------------------------------------------------------------------

function renderMatrixView(filtered: Donation[]): string {
  if (filtered.length === 0) return emptyState();

  const data = buildMatrix(filtered, 30);
  if (data.donors.length === 0) return emptyState();

  // Color scale: white → amber → deep orange
  const cellColor = (amount: number): string => {
    if (amount === 0) return 'transparent';
    // Log scale for better visual distribution
    const logMax = Math.log10(data.maxCell + 1);
    const logVal = Math.log10(amount + 1);
    const t = logVal / logMax;
    // Interpolate from light amber to deep orange
    const r = Math.round(255);
    const g = Math.round(245 - t * 145);
    const b = Math.round(235 - t * 195);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const headerCells = data.parties
    .map((code) => {
      const party = PARTIES[code as PartyCode];
      return `<th class="matrix-party-header" style="writing-mode: vertical-lr; text-orientation: mixed;">
        <span class="party-swatch" style="background:${party?.colour ?? '#6b7280'}"></span>
        ${escapeHtml(party?.shortName ?? code)}
      </th>`;
    })
    .join('');

  const rows = data.donors
    .map((donor) => {
      const sector = data.donorSectors.get(donor)!;
      const total = data.donorTotals.get(donor) ?? 0;
      const cells = data.parties
        .map((party) => {
          const amount = data.cells.get(`${donor}||${party}`) ?? 0;
          const bg = cellColor(amount);
          const textColor = amount > 0 ? (amount > data.maxCell * 0.3 ? '#7c2d12' : '#92400e') : '';
          const cellTip = `${donor} → ${PARTIES[party as PartyCode]?.shortName ?? party}: ${amount > 0 ? formatCurrency(amount) : 'No donation'}`;
          return `<td class="matrix-cell" style="background:${bg};${textColor ? 'color:' + textColor : ''}"
            data-donor="${escapeHtml(donor)}" data-party="${party}" data-amount="${amount}"
            data-tip="${escapeHtml(cellTip)}" aria-label="${escapeHtml(cellTip)}">
            ${amount > 0 ? formatCurrency(amount, { compact: true }) : ''}
          </td>`;
        })
        .join('');
      return `
        <tr>
          <td class="matrix-donor-cell">
            <span class="party-swatch" style="background:${SECTOR_COLORS[sector]}"></span>
            <span class="matrix-donor-name" data-tip="${escapeHtml(donor)}" aria-label="${escapeHtml(donor)}">${escapeHtml(donor.length > 32 ? donor.slice(0, 31) + '\u2026' : donor)}</span>
          </td>
          <td class="matrix-total">${formatCurrency(total, { compact: true })}</td>
          ${cells}
        </tr>
      `;
    })
    .join('');

  return `
    <h3 class="section-title">Donor &times; Party cross-reference</h3>
    <p class="section-subtitle">
      Heatmap showing who gives to whom. Rows are the top ${data.donors.length} donors by total amount.
      Columns are recipient parties. Darker cells mean larger donations.
      Hover over any cell for the exact figure. Look for rows with colour in multiple columns — those are
      donors who give to both sides of politics.
    </p>
    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="matrix-corner">Donor</th>
            <th class="matrix-total-header">Total</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <div class="matrix-color-legend">
      <span class="matrix-legend-label">Donation size:</span>
      <div class="matrix-gradient"></div>
      <span class="matrix-legend-range">${formatCurrency(0)} &mdash; ${formatCurrency(data.maxCell, { compact: true })}</span>
    </div>
  `;
}

function attachMatrixHandlers(): void {
  document.querySelectorAll<HTMLTableCellElement>('.matrix-cell').forEach((cell) => {
    cell.addEventListener('mouseenter', () => cell.classList.add('matrix-cell-hover'));
    cell.addEventListener('mouseleave', () => cell.classList.remove('matrix-cell-hover'));
  });
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function emptyState(): string {
  return `
    <div class="empty-state">
      <h4>No donations match the current filter</h4>
      <p>Try clearing one or more filters from the left rail.</p>
    </div>
  `;
}

function partyLegend(codes: PartyCode[]): string {
  const unique = Array.from(new Set(codes));
  const items = unique
    .map((code) => {
      const p = PARTIES[code];
      if (!p) return '';
      return `<span><span class="party-swatch" style="background:${p.colour}"></span>${escapeHtml(p.shortName)}</span>`;
    })
    .join('');
  return `<div class="legend">${items}</div>`;
}

// ----------------------------------------------------------------------
// Event handlers
// ----------------------------------------------------------------------

function debounce<F extends (...args: unknown[]) => void>(fn: F, ms: number): F {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as F;
}

function attachHandlers(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) {
    const onInput = debounce(() => {
      state.filters.query = searchInput.value;
      persistState();
      renderTabContent();
    }, 250);
    searchInput.addEventListener('input', onInput);
  }

  // Tab buttons
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab as TabId;
      persistState();
      updateTabButtons();
      renderTabContent();
    });
  });

  // Filter checkboxes
  document.querySelectorAll<HTMLInputElement>('.filter-rail input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const facet = cb.dataset.facet;
      const value = cb.value;
      if (facet === 'jurisdiction') {
        if (cb.checked) state.filters.jurisdictions.add(value as Jurisdiction['code']);
        else state.filters.jurisdictions.delete(value as Jurisdiction['code']);
      } else if (facet === 'party') {
        if (cb.checked) state.filters.parties.add(value as PartyCode);
        else state.filters.parties.delete(value as PartyCode);
      } else if (facet === 'donorType') {
        if (cb.checked) state.filters.donorTypes.add(value as DonorType);
        else state.filters.donorTypes.delete(value as DonorType);
      }
      persistState();
      renderTabContent();
    });
  });

  // Clear filters
  document.getElementById('filter-clear')?.addEventListener('click', () => {
    state.filters = defaultFilterState();
    persistState();
    const si = document.getElementById('search-input') as HTMLInputElement | null;
    if (si) si.value = '';
    renderFilterRail();
    renderTabContent();
    attachHandlers(); // re-attach because we re-rendered the filter rail
  });

  // Modal buttons
  document.getElementById('btn-about')?.addEventListener('click', () => openModal(aboutModalHtml()));
  document.getElementById('btn-glossary')?.addEventListener('click', () => openModal(glossaryModalHtml()));

  // Modal backdrop click-away
  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-backdrop')) closeModal();
  });

  // Escape key closes modal and glossary tooltip
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      hideGlossaryTooltip();
    }
  });
}

// Global click handler for glossary icons (event delegation so newly-rendered
// content Just Works).
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const link = target.closest<HTMLElement>('.glossary-link');
  if (link) {
    e.stopPropagation();
    const term = link.dataset.term;
    if (term) showGlossaryTooltip(link, term);
    return;
  }
  // Clicking elsewhere dismisses the tooltip (unless clicking inside the tooltip)
  if (!target.closest('.glossary-tooltip')) {
    hideGlossaryTooltip();
  }
});

// ----------------------------------------------------------------------
// Boot — fetch the federal dataset, then render. On failure the app still
// works with the curated state snapshot plus a visible notice.
// ----------------------------------------------------------------------

async function boot(): Promise<void> {
  const app = document.getElementById('app')!;
  app.innerHTML = '<div class="boot-loading">Loading donation data…</div>';

  const federal = await loadFederalDonations();
  federalMeta = federal.meta;
  federalLoadFailed = federal.donations.length === 0;
  ALL_DONATIONS = [...federal.donations, ...STATE_DONATIONS_FILTERED];

  render();
}

initTooltip();
void boot();
