// Registered political parties and common recipient entities that appear
// across federal and state donation registers.

export type PartyCode =
  | 'ALP'
  | 'LIB'
  | 'NAT'
  | 'LNP'
  | 'GRN'
  | 'ONP'
  | 'UAP'
  | 'IND'
  | 'CA'
  | 'SFF'
  | 'KAP'
  | 'JLN'
  | 'OTH';

export type Party = {
  code: PartyCode;
  name: string;
  shortName: string;
  colour: string;
  alignment: 'Left' | 'Right' | 'Centre' | 'Populist' | 'Minor';
  description: string;
};

export const PARTIES: Record<PartyCode, Party> = {
  ALP: {
    code: 'ALP',
    name: 'Australian Labor Party',
    shortName: 'Labor',
    colour: '#de3533',
    alignment: 'Left',
    description: "Australia's major centre-left party, formed in 1891.",
  },
  LIB: {
    code: 'LIB',
    name: 'Liberal Party of Australia',
    shortName: 'Liberal',
    colour: '#1c4f9c',
    alignment: 'Right',
    description: "Australia's major centre-right party, founded in 1944 by Robert Menzies.",
  },
  NAT: {
    code: 'NAT',
    name: 'The Nationals',
    shortName: 'Nationals',
    colour: '#006644',
    alignment: 'Right',
    description: 'Rural and regional centre-right party; Coalition partner to the Liberal Party federally.',
  },
  LNP: {
    code: 'LNP',
    name: 'Liberal National Party of Queensland',
    shortName: 'LNP',
    colour: '#004bb8',
    alignment: 'Right',
    description: 'Queensland merger of Liberal and National parties, formed 2008.',
  },
  GRN: {
    code: 'GRN',
    name: 'Australian Greens',
    shortName: 'Greens',
    colour: '#009c3d',
    alignment: 'Left',
    description: 'Progressive environmental party founded in 1992.',
  },
  ONP: {
    code: 'ONP',
    name: 'Pauline Hanson\u2019s One Nation',
    shortName: 'One Nation',
    colour: '#f36c21',
    alignment: 'Populist',
    description: 'Right-wing populist party founded in 1997 by Pauline Hanson.',
  },
  UAP: {
    code: 'UAP',
    name: 'United Australia Party',
    shortName: 'UAP',
    colour: '#ffed00',
    alignment: 'Populist',
    description: "Clive Palmer's revived United Australia Party, dominant donor 2019-2022.",
  },
  IND: {
    code: 'IND',
    name: 'Independent candidates',
    shortName: 'Independents',
    colour: '#7c3aed',
    alignment: 'Centre',
    description: 'Includes Teal independents (Zali Steggall, Monique Ryan, Allegra Spender et al) and other crossbenchers.',
  },
  CA: {
    code: 'CA',
    name: 'Climate 200',
    shortName: 'Climate 200',
    colour: '#0d9488',
    alignment: 'Centre',
    description: 'Third-party funding vehicle supporting climate-focused independents, founded by Simon Holmes \u00e0 Court.',
  },
  SFF: {
    code: 'SFF',
    name: 'Shooters, Fishers and Farmers Party',
    shortName: 'SFF',
    colour: '#8b5a2b',
    alignment: 'Minor',
    description: 'Rural/regional minor party focused on firearms, hunting and fishing rights.',
  },
  KAP: {
    code: 'KAP',
    name: "Katter's Australian Party",
    shortName: 'KAP',
    colour: '#c41e3a',
    alignment: 'Populist',
    description: 'North Queensland regional party founded by Bob Katter.',
  },
  JLN: {
    code: 'JLN',
    name: 'Jacqui Lambie Network',
    shortName: 'Lambie',
    colour: '#fbbf24',
    alignment: 'Minor',
    description: 'Tasmanian minor party led by Senator Jacqui Lambie.',
  },
  OTH: {
    code: 'OTH',
    name: 'Other / Multiple',
    shortName: 'Other',
    colour: '#6b7280',
    alignment: 'Minor',
    description: 'Minor parties, micro parties, and donations split across recipients.',
  },
};

export const PARTY_LIST: Party[] = Object.values(PARTIES);
