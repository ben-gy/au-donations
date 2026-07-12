// Type declarations for collect.mjs so the vitest suite can import its
// pure helpers under strict TypeScript.

export declare const SOURCE_URL: string;

export declare function extractZipEntry(zipBuf: Buffer, wantedName: string): Buffer;
export declare function parseCsv(text: string): string[][];
export declare function normalizeFy(raw: unknown): string | null;
export declare function mapRecipientParty(name: string): string;
export declare function classifyDonorType(name: string): string;
export declare function cleanName(raw: unknown): string;

export type NormalizedDonation = {
  id: string;
  donor: string;
  donorType: string;
  recipient: string;
  recipientParty: string;
  jurisdiction: 'CTH';
  amount: number;
  fy: string;
  category: 'Cash';
};

export declare function normalizeDonations(
  rows: string[][],
  fyWindow?: number,
): {
  donations: NormalizedDonation[];
  keptFys: string[];
  skipped: number;
  rawRows: number;
};
