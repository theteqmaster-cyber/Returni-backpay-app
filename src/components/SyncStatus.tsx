'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/offline-db';

export function SyncStatus() {
  const [pendingTx, setPendingTx] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const loadPending = async () => {
    if (db) {
      setPendingTx(await db.pendingTransactions.where('synced').equals(0).count());
      setPendingClaims(await db.pendingClaims.where('synced').equals(0).count());
    }
  };

  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncAll = async () => {
    if (!navigator.onLine || !db) return;
    
    setSyncing(true);
    setError('');

    try {
      // Sync Transactions
      const txs = await db.pendingTransactions.where('synced').equals(0).toArray();
      for (const tx of txs) {
        try {
          // Since the server calculates 4% and QR, we are pushing the pending transaction to the server asynchronously.
          // Note: The physical shop would have likely failed to give the client a QR if offline.
          // But capturing the backpay liability is still necessary.
          const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: tx.amount, phone: tx.phone, merchantId: tx.merchantId }),
          });
          if (res.ok) {
             if (tx.id) await db.pendingTransactions.update(tx.id, { synced: true });
          }
        } catch (e) {
          console.error("Tx Sync error", e);
        }
      }

      // Sync Claims
      const claims = await db.pendingClaims.where('synced').equals(0).toArray();
      for (const claim of claims) {
        try {
          const res = await fetch('/api/claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: claim.token, merchantId: claim.merchantId }),
          });
          // Also mark as synced if 400/404 because the claim token might be invalid/already claimed and we shouldn't retry infinitely
          if (res.ok || res.status >= 400) {
             if (claim.id) await db.pendingClaims.update(claim.id, { synced: true });
          }
        } catch (e) {
             console.error("Claim Sync error", e);
        }
      }

      await loadPending();
    } catch (err) {
      setError('Sync failed. Will retry later.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const onOnline = () => syncAll();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPending = pendingTx + pendingClaims;

  if (totalPending === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50 border-t border-amber-200 z-50 flex justify-between items-center shadow-lg">
      <div className="flex flex-col">
        <span className="text-amber-800 text-sm font-semibold">
           Offline Mode Enabled
        </span>
        <span className="text-amber-700 text-xs">
           {totalPending} operations pending sync
        </span>
        {error && <span className="text-red-600 text-[10px] mt-1">{error}</span>}
      </div>
      <button
        onClick={syncAll}
        disabled={syncing || !navigator.onLine}
        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition shadow-sm"
      >
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
