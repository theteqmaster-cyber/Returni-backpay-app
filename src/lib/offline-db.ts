import Dexie, { type Table } from 'dexie';

export interface PendingVisit {
  id?: number;
  merchantId: string;
  customerPhone: string;
  pointsEarned: number;
  createdAt: string;
  synced: boolean;
}

export class OfflineDB extends Dexie {
  pendingVisits!: Table<PendingVisit, number>;

  constructor() {
    super('ReturniOffline');
    this.version(1).stores({
      pendingVisits: '++id, merchantId, synced, createdAt',
    });
  }
}

export const db = typeof window !== 'undefined' ? new OfflineDB() : null;
