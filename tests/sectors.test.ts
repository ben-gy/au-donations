import { describe, expect, it } from 'vitest';
import {
  classifySector,
  computeFlows,
  buildNetwork,
  buildMatrix,
} from '../src/utils/sectors';
import { DONATIONS_FILTERED } from '../src/data/donations';
import type { Donation } from '../src/data/donations';

const sample: Donation[] = [
  {
    id: 's1', donor: 'Mineralogy Pty Ltd', donorType: 'Corporation',
    recipient: 'United Australia Party', recipientParty: 'UAP',
    jurisdiction: 'CTH', amount: 83_600_000, fy: '2021-22', category: 'Cash',
  },
  {
    id: 's2', donor: 'CFMEU', donorType: 'Union',
    recipient: 'Australian Labor Party', recipientParty: 'ALP',
    jurisdiction: 'CTH', amount: 1_200_000, fy: '2022-23', category: 'Cash',
  },
  {
    id: 's3', donor: 'Pratt Holdings Pty Ltd', donorType: 'Corporation',
    recipient: 'Liberal Party', recipientParty: 'LIB',
    jurisdiction: 'CTH', amount: 500_000, fy: '2022-23', category: 'Cash',
  },
  {
    id: 's4', donor: 'Pratt Holdings Pty Ltd', donorType: 'Corporation',
    recipient: 'Australian Labor Party', recipientParty: 'ALP',
    jurisdiction: 'CTH', amount: 400_000, fy: '2022-23', category: 'Cash',
  },
  {
    id: 's5', donor: 'Simon Holmes à Court', donorType: 'Individual',
    recipient: 'Climate 200', recipientParty: 'CA',
    jurisdiction: 'CTH', amount: 125_000, fy: '2021-22', category: 'Cash',
  },
  {
    id: 's6', donor: 'Pharmacy Guild of Australia', donorType: 'Industry body',
    recipient: 'Liberal Party', recipientParty: 'LIB',
    jurisdiction: 'CTH', amount: 125_000, fy: '2022-23', category: 'Cash',
  },
  {
    id: 's7', donor: 'Cormack Foundation', donorType: 'Associated entity',
    recipient: 'Liberal Party', recipientParty: 'LIB',
    jurisdiction: 'CTH', amount: 2_850_000, fy: '2022-23', category: 'Cash',
  },
  {
    id: 's8', donor: 'Tabcorp Holdings Ltd', donorType: 'Corporation',
    recipient: 'Liberal Party', recipientParty: 'LIB',
    jurisdiction: 'CTH', amount: 110_000, fy: '2022-23', category: 'Cash',
  },
];

describe('classifySector', () => {
  it('classifies mining companies', () => {
    expect(classifySector(sample[0])).toBe('Mining & Energy');
  });
  it('classifies unions', () => {
    expect(classifySector(sample[1])).toBe('Unions');
  });
  it('classifies individuals', () => {
    expect(classifySector(sample[4])).toBe('Individuals');
  });
  it('classifies health/pharma', () => {
    expect(classifySector(sample[5])).toBe('Health & Pharma');
  });
  it('classifies associated entities', () => {
    expect(classifySector(sample[6])).toBe('Associated Entities');
  });
  it('classifies gambling', () => {
    expect(classifySector(sample[7])).toBe('Hospitality & Gambling');
  });
  it('classifies every donation in the full dataset', () => {
    for (const d of DONATIONS_FILTERED) {
      const sector = classifySector(d);
      expect(sector).toBeTruthy();
      expect(typeof sector).toBe('string');
    }
  });
});

describe('computeFlows', () => {
  it('aggregates sectors to parties', () => {
    const flows = computeFlows(sample);
    expect(flows.length).toBeGreaterThan(0);
    const mining = flows.find((f) => f.sector === 'Mining & Energy');
    expect(mining?.total).toBe(83_600_000);
    expect(mining?.flows.some((f) => f.partyCode === 'UAP')).toBe(true);
  });
  it('returns empty array for empty input', () => {
    expect(computeFlows([])).toEqual([]);
  });
});

describe('buildNetwork', () => {
  it('creates nodes for donors and recipients', () => {
    const { nodes, edges } = buildNetwork(sample);
    const donors = nodes.filter((n) => n.type === 'donor');
    const recipients = nodes.filter((n) => n.type === 'recipient');
    expect(donors.length).toBeGreaterThan(0);
    expect(recipients.length).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
  });
  it('aggregates duplicate donor→party edges', () => {
    // Pratt → LIB and Pratt → ALP should each be one edge
    const { edges } = buildNetwork(sample);
    const prattEdges = edges.filter((e) => e.sourceId === 'd:Pratt Holdings Pty Ltd');
    expect(prattEdges).toHaveLength(2);
    const prattToLib = prattEdges.find((e) => e.targetId === 'r:LIB');
    expect(prattToLib?.amount).toBe(500_000);
  });
});

describe('buildMatrix', () => {
  it('returns donors, parties, and cells', () => {
    const data = buildMatrix(sample);
    expect(data.donors.length).toBeGreaterThan(0);
    expect(data.parties.length).toBeGreaterThan(0);
    expect(data.maxCell).toBeGreaterThan(0);
  });
  it('donors are sorted by total descending', () => {
    const data = buildMatrix(sample);
    expect(data.donors[0]).toBe('Mineralogy Pty Ltd');
  });
  it('respects topN parameter', () => {
    const data = buildMatrix(sample, 3);
    expect(data.donors.length).toBe(3);
  });
  it('cell values are aggregated correctly', () => {
    const data = buildMatrix(sample);
    const prattLib = data.cells.get('Pratt Holdings Pty Ltd||LIB');
    expect(prattLib).toBe(500_000);
    const prattAlp = data.cells.get('Pratt Holdings Pty Ltd||ALP');
    expect(prattAlp).toBe(400_000);
  });
});
