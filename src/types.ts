export interface Book {
  id: string;
  title: string;
  author: string;
  authorSummary: string;
  synopsis: string;
  printQuality: string;
  ddcCode: string;
  ddcCategory: string;
  publicationYear: number;
  coverUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DdcClass {
  code: string;
  name: string;
  category: string;
  mainClassCode: string;
  mainClassName: string;
  description: string;
  color: string;
}

export interface GasConfig {
  webAppUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
  isConnected: boolean;
}

export type ViewMode = 'catalog' | 'add' | 'batch-print' | 'gas-guide' | 'ddc-guide';
