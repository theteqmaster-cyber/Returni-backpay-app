import Dexie, { type Table } from 'dexie';

export interface PendingTransaction {
  id?: number;
  merchantId: string;
  amount: string;
  phone: string;
  createdAt: string;
  synced: boolean;
}

export interface PendingClaim {
  id?: number;
  merchantId: string;
  token: string;
  createdAt: string;
  synced: boolean;
}

export class OfflineDB extends Dexie {
  pendingTransactions!: Table<PendingTransaction, number>;
  pendingClaims!: Table<PendingClaim, number>;

  constructor() {
    super('ReturniOfflineV2'); // new db name to clear out V1
    this.version(1).stores({
      pendingTransactions: '++id, merchantId, synced, createdAt',
      pendingClaims: '++id, merchantId, synced, createdAt',
    });
  }
}

export const db = typeof window !== 'undefined' ? new OfflineDB() : null;
