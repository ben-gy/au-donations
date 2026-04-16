// Classifies donors into industry sectors for the network graph, flow,
// and matrix visualizations. Uses name-pattern matching against the curated
// dataset — works because the dataset is hand-assembled and donor names are
// stable. Unrecognised names fall through to donorType-based defaults.

export type Sector =
  | 'Mining & Energy'
  | 'Finance & Banking'
  | 'Property & Construction'
  | 'Hospitality & Gambling'
  | 'Health & Pharma'
  | 'Transport'
  | 'Unions'
  | 'Associated Entities'
  | 'Business & Industry'
  | 'Advocacy & Third Parties'
  | 'Individuals';

export const SECTOR_COLORS: Record<Sector, string> = {
  'Mining & Energy': '#d97706',
  'Finance & Banking': '#0284c7',
  'Property & Construction': '#7c3aed',
  'Hospitality & Gambling': '#e11d48',
  'Health & Pharma': '#059669',
  'Transport': '#475569',
  'Unions': '#dc2626',
  'Associated Entities': '#6b7280',
  'Business & Industry': '#0d9488',
  'Advocacy & Third Parties': '#8b5cf6',
  'Individuals': '#f59e0b',
};

export const ALL_SECTORS: Sector[] = Object.keys(SECTOR_COLORS) as Sector[];

// Lowercase substring → sector. First match wins. Order matters for
// ambiguous names (e.g. "Australian Hotels Association" → Hospitality,
// not Business).
const PATTERNS: Array<[string[], Sector]> = [
  // Mining & Energy
  [['mineralogy', 'queensland nickel', 'palmer leisure', 'bhp', 'rio tinto', 'fortescue',
    'hancock', 'rinehart', 'glencore', 'whitehaven', 'adani', 'minerals council',
    'woodside', 'santos', 'origin energy', 'agl energy', 'energy australia',
    'squadron energy', 'tilt renewables', 'petroleum', 'iluka', 'chevron',
    'chamber of minerals', 'qgc', 'stanwell'], 'Mining & Energy'],

  // Finance & Banking
  [['macquarie group', 'commonwealth bank', 'westpac', 'anz bank', 'national australia bank',
    'banking association', 'financial services', 'pegasus capital', 'insurance council'], 'Finance & Banking'],

  // Property & Construction
  [['walker corporation', 'meriton', 'lendlease', 'mirvac', 'stockland', 'grocon',
    'property council', 'housing industry', 'master builders', 'infrastructure nsw'], 'Property & Construction'],

  // Hospitality & Gambling
  [['hotel', 'clubs nsw', 'clubs queensland', 'tabcorp', 'sportsbet', 'lottoland',
    'crown resorts', 'star entertainment', 'federal group', 'restaurant', 'beverage',
    'food and grocery'], 'Hospitality & Gambling'],

  // Health & Pharma
  [['pharmacy guild', 'medicines australia', 'aspen medical', 'medical association',
    'csl limited', 'ramsay health'], 'Health & Pharma'],

  // Transport
  [['transurban', 'qantas', 'virgin australia', 'toll holdings', 'aurizon'], 'Transport'],

  // Unions
  [['cfmeu', 'construction forestry', 'shop distributive', 'sda', 'workers union',
    'health services union', 'education union', 'manufacturing workers',
    'transport workers', 'finance sector union', 'services union', 'maritime union',
    'electrical trades', 'nursing', 'midwifery', 'teachers', 'nurses', 'together queensland',
    'unionsa', 'unionswa', 'unionsact', 'unions nsw', 'actu'], 'Unions'],

  // Associated Entities
  [['cormack foundation', 'free enterprise', '500 club', 'greenfields foundation',
    'millennium forum', '1973 foundation', 'vapold', "katter's australian party inc",
    'bob hawke', 'john curtin', 'labor holdings'], 'Associated Entities'],

  // Advocacy & Third Parties
  [['climate 200', 'advance australia', 'clean energy council', 'greens supporters',
    'lambie network supporters', 'actu'], 'Advocacy & Third Parties'],

  // Business & Industry
  [['wesfarmers', 'coles group', 'woolworths', 'harvey norman', 'village roadshow',
    'news corp', 'seven west', 'business council', 'chamber of commerce', 'ai group',
    'retailers association', 'franchise council', 'forest products', 'farmers federation',
    'graincorp', 'elders limited', 'nsw business', 'business sa', 'victorian chamber',
    'canberra business', 'canva', 'megaport', 'maurice blackburn', 'slater and gordon',
    'herbert smith', 'allens', 'king & wood', 'pwc', 'deloitte', 'kpmg', 'ernst & young',
    'aldi', 'nsw minerals', 'racv'], 'Business & Industry'],
];

import type { Donation, DonorType } from '../data/donations';

const DONOR_TYPE_FALLBACK: Partial<Record<DonorType, Sector>> = {
  Union: 'Unions',
  'Associated entity': 'Associated Entities',
  Foundation: 'Associated Entities',
  'Third party': 'Advocacy & Third Parties',
  'Industry body': 'Business & Industry',
  Individual: 'Individuals',
};

const _cache = new Map<string, Sector>();

export function classifySector(donation: Donation): Sector {
  const key = donation.donor;
  const cached = _cache.get(key);
  if (cached) return cached;

  const lower = key.toLowerCase();
  for (const [patterns, sector] of PATTERNS) {
    for (const p of patterns) {
      if (lower.includes(p)) {
        _cache.set(key, sector);
        return sector;
      }
    }
  }

  // Fallback by donor type
  const fallback = DONOR_TYPE_FALLBACK[donation.donorType] ?? 'Business & Industry';
  _cache.set(key, fallback);
  return fallback;
}

/** Aggregate donations into sector → party → total for the flow view. */
export type SectorPartyFlow = {
  sector: Sector;
  flows: Array<{ party: string; partyCode: string; amount: number }>;
  total: number;
};

export function computeFlows(donations: Donation[]): SectorPartyFlow[] {
  const map = new Map<Sector, Map<string, { party: string; partyCode: string; amount: number }>>();
  for (const d of donations) {
    const sector = classifySector(d);
    if (!map.has(sector)) map.set(sector, new Map());
    const partyMap = map.get(sector)!;
    const existing = partyMap.get(d.recipientParty);
    if (existing) {
      existing.amount += d.amount;
    } else {
      partyMap.set(d.recipientParty, {
        party: d.recipientParty,
        partyCode: d.recipientParty,
        amount: d.amount,
      });
    }
  }
  const result: SectorPartyFlow[] = [];
  for (const [sector, partyMap] of map) {
    const flows = [...partyMap.values()].sort((a, b) => b.amount - a.amount);
    const total = flows.reduce((s, f) => s + f.amount, 0);
    result.push({ sector, flows, total });
  }
  return result.sort((a, b) => b.total - a.total);
}

/** Build an adjacency structure for the network graph. */
export type NetworkNode = {
  id: string;
  label: string;
  type: 'donor' | 'recipient';
  sector?: Sector;
  partyCode?: string;
  total: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export type NetworkEdge = {
  sourceId: string;
  targetId: string;
  amount: number;
};

export function buildNetwork(donations: Donation[]): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const donorMap = new Map<string, { total: number; sector: Sector }>();
  const recipientMap = new Map<string, { total: number; partyCode: string }>();
  const edgeMap = new Map<string, number>();

  for (const d of donations) {
    // Donors
    const de = donorMap.get(d.donor);
    if (de) de.total += d.amount;
    else donorMap.set(d.donor, { total: d.amount, sector: classifySector(d) });

    // Recipients — group by party code for cleaner graph
    const re = recipientMap.get(d.recipientParty);
    if (re) re.total += d.amount;
    else recipientMap.set(d.recipientParty, { total: d.amount, partyCode: d.recipientParty });

    // Edges (donor → party)
    const ek = `${d.donor}||${d.recipientParty}`;
    edgeMap.set(ek, (edgeMap.get(ek) ?? 0) + d.amount);
  }

  const nodes: NetworkNode[] = [];
  const maxDonor = Math.max(...[...donorMap.values()].map((v) => v.total), 1);
  const maxRecipient = Math.max(...[...recipientMap.values()].map((v) => v.total), 1);

  // Donor nodes — start on the left
  let i = 0;
  for (const [name, data] of donorMap) {
    const r = 4 + 20 * Math.sqrt(data.total / maxDonor);
    nodes.push({
      id: `d:${name}`,
      label: name,
      type: 'donor',
      sector: data.sector,
      total: data.total,
      x: -300 + (Math.random() - 0.5) * 200,
      y: -400 + (i * 800) / donorMap.size + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
      radius: r,
    });
    i++;
  }

  // Recipient nodes — fixed on the right
  let j = 0;
  const recipientKeys = [...recipientMap.keys()].sort();
  for (const code of recipientKeys) {
    const data = recipientMap.get(code)!;
    const r = 8 + 25 * Math.sqrt(data.total / maxRecipient);
    nodes.push({
      id: `r:${code}`,
      label: code,
      type: 'recipient',
      partyCode: data.partyCode,
      total: data.total,
      x: 350 + (Math.random() - 0.5) * 30,
      y: -300 + (j * 600) / recipientKeys.length,
      vx: 0,
      vy: 0,
      radius: r,
    });
    j++;
  }

  const edges: NetworkEdge[] = [];
  for (const [key, amount] of edgeMap) {
    const [donor, party] = key.split('||');
    edges.push({ sourceId: `d:${donor}`, targetId: `r:${party}`, amount });
  }

  return { nodes, edges };
}

/**
 * Run a simple force simulation to lay out the bipartite donor→party graph.
 * Recipients are pinned on the right; donors float on the left.
 */
export function runForceSimulation(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  iterations: number = 150,
): void {
  const nodeIndex = new Map<string, number>();
  for (let k = 0; k < nodes.length; k++) nodeIndex.set(nodes[k].id, k);

  const edgeIndices = edges.map((e) => ({
    source: nodeIndex.get(e.sourceId) ?? -1,
    target: nodeIndex.get(e.targetId) ?? -1,
    weight: Math.log10(Math.max(e.amount, 1)) / 8,
  })).filter((e) => e.source >= 0 && e.target >= 0);

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 0.3 * (1 - iter / iterations);

    // Repulsion between donor nodes only (recipients are pinned)
    const donorNodes = nodes.filter((n) => n.type === 'donor');
    for (let a = 0; a < donorNodes.length; a++) {
      for (let b = a + 1; b < donorNodes.length; b++) {
        const na = donorNodes[a];
        const nb = donorNodes[b];
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const minDist = na.radius + nb.radius + 6;
        if (dist < minDist * 3) {
          const force = -alpha * 400 / (dist * dist);
          const fx = force * dx / dist;
          const fy = force * dy / dist;
          na.vx -= fx;
          na.vy -= fy;
          nb.vx += fx;
          nb.vy += fy;
        }
      }
    }

    // Attraction along edges (spring toward connected recipients)
    for (const edge of edgeIndices) {
      const s = nodes[edge.source];
      const t = nodes[edge.target];
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = alpha * edge.weight * 0.15 * (dist - 250);
      const fx = force * dx / dist;
      const fy = force * dy / dist;
      if (s.type === 'donor') {
        s.vx += fx;
        s.vy += fy;
      }
    }

    // Gentle x-gravity to keep donors on the left
    for (const node of nodes) {
      if (node.type === 'donor') {
        node.vx += (-200 - node.x) * 0.005 * alpha;
        node.vy -= node.y * 0.002 * alpha;
      }
    }

    // Apply velocity with damping (donors only; recipients pinned)
    for (const node of nodes) {
      if (node.type === 'donor') {
        node.vx *= 0.65;
        node.vy *= 0.65;
        node.x += node.vx;
        node.y += node.vy;
      }
    }
  }
}

/** Compute the donor×party matrix for the heatmap view. */
export type MatrixCell = {
  donor: string;
  sector: Sector;
  party: string;
  amount: number;
};

export type MatrixData = {
  donors: string[];
  parties: string[];
  cells: Map<string, number>; // key = "donor||party"
  donorSectors: Map<string, Sector>;
  donorTotals: Map<string, number>;
  partyTotals: Map<string, number>;
  maxCell: number;
};

export function buildMatrix(donations: Donation[], topN: number = 25): MatrixData {
  // Aggregate donor → party totals
  const cellMap = new Map<string, number>();
  const donorTotals = new Map<string, number>();
  const partyTotals = new Map<string, number>();
  const donorSectors = new Map<string, Sector>();

  for (const d of donations) {
    const key = `${d.donor}||${d.recipientParty}`;
    cellMap.set(key, (cellMap.get(key) ?? 0) + d.amount);
    donorTotals.set(d.donor, (donorTotals.get(d.donor) ?? 0) + d.amount);
    partyTotals.set(d.recipientParty, (partyTotals.get(d.recipientParty) ?? 0) + d.amount);
    if (!donorSectors.has(d.donor)) donorSectors.set(d.donor, classifySector(d));
  }

  // Top N donors by total
  const donors = [...donorTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name]) => name);

  // Parties that received from these top donors
  const partySet = new Set<string>();
  for (const donor of donors) {
    for (const [key] of cellMap) {
      if (key.startsWith(`${donor}||`)) {
        partySet.add(key.split('||')[1]);
      }
    }
  }
  const parties = [...partySet].sort((a, b) => {
    return (partyTotals.get(b) ?? 0) - (partyTotals.get(a) ?? 0);
  });

  // Find max cell for color scaling
  let maxCell = 0;
  for (const donor of donors) {
    for (const party of parties) {
      const v = cellMap.get(`${donor}||${party}`) ?? 0;
      if (v > maxCell) maxCell = v;
    }
  }

  return { donors, parties, cells: cellMap, donorSectors, donorTotals, partyTotals, maxCell };
}
