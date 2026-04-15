import './styles.css';
import { DONATIONS_FILTERED, type Donation, type DonorType } from './data/donations';
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

// ----------------------------------------------------------------------
// App state
// ----------------------------------------------------------------------

type TabId = 'table' | 'donors' | 'recipients' | 'parties' | 'years' | 'jurisdictions';

type AppState = {
  filters: FilterState;
  activeTab: TabId;
  sortField: SortField;
  sortDir: SortDir;
};

const state: AppState = {
  filters: defaultFilterState(),
  activeTab: 'table',
  sortField: 'amount',
  sortDir: 'desc',
};

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
    <p>This site ships with a <strong>curated snapshot</strong> of ${DONATIONS_FILTERED.length} publicly disclosed donation records drawn from the registers above, covering recent financial years. Amounts reflect publicly reported figures and have been lightly rounded. The snapshot is illustrative — it is <em>not</em> an exhaustive or live mirror of every disclosure ever filed. For authoritative data, always consult the source registers.</p>

    <h3>Key caveats</h3>
    <ul>
      <li>Federal ${glossaryIcon('receipt')}"receipts" include commercial payments (ticket sales, subscriptions, investment income) alongside true gifts. State returns tend to report gifts only.</li>
      <li>Donations below each jurisdiction's ${glossaryIcon('disclosure-threshold')}disclosure threshold are legal but anonymous — they do not appear here at all.</li>
      <li>${glossaryIcon('aggregate')}Aggregated donations from related donors may appear under a parent entity name.</li>
      <li>Federal disclosure lags up to 20 months — a gift made in July 2024 is not publicly disclosed until February 2026.</li>
      <li>NSW, Victoria and Queensland prohibit ${glossaryIcon('prohibited-donor')}property developer donations at the state level, but the same developers may donate federally or in other states.</li>
    </ul>

    <h3>Who built this?</h3>
    <p>Built by <a href="https://benrichardson.dev/" target="_blank" rel="noopener noreferrer">benrichardson.dev</a>. Non-partisan, no tracking, no ads. Code is self-contained static HTML — you can archive this page for offline reference.</p>
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
        <p>Search across federal and state donation registers — over ${DONATIONS_FILTERED.length} disclosed records from the AEC Transparency Register plus six state and two territory regulators. One search box, eight jurisdictions.</p>
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
          <button class="tab-btn" data-tab="jurisdictions" role="tab">Jurisdictions</button>
        </div>
        <div class="tab-content" id="tab-content"></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-col">
          <h5>About this site</h5>
          <p>Donations AU unifies Australia's federal and state political donation registers into one searchable interface. The data is drawn from publicly disclosed returns and is illustrative only — consult the source registers for authoritative figures.</p>
          <p>Built by <a href="https://benrichardson.dev/">benrichardson.dev</a>. No analytics, no cookies, no tracking.</p>
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
  for (const d of DONATIONS_FILTERED) {
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
  return filterDonations(DONATIONS_FILTERED, state.filters);
}

function updateResultSummary(filtered: Donation[]): void {
  const summary = document.getElementById('result-summary');
  if (!summary) return;
  const total = grandTotal(filtered);
  const donors = uniqueDonorCount(filtered);
  summary.innerHTML = `
    Showing <strong>${formatNumber(filtered.length)}</strong> of ${formatNumber(DONATIONS_FILTERED.length)} records &middot;
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
        <td><span class="jurisdiction-pill" title="${escapeHtml(jurisdictionName)}">${escapeHtml(d.jurisdiction)}</span></td>
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
          return `<div class="bar-fill" style="width:${pct}%; background:${party.colour}" title="${party.shortName}: ${formatCurrency(amount)}"></div>`;
        })
        .join('');
      return `
        <div class="bar-row">
          <div class="label" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
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
      return `
        <div class="bar-row">
          <div class="label" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${party?.colour ?? '#6b7280'}"></div></div>
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
          return `<div class="bar-fill" style="width:${pct}%; background:${party.colour}" title="${party.shortName}: ${formatCurrency(amount)}"></div>`;
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
// Boot
// ----------------------------------------------------------------------

render();
