'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/offline-db';

const POINTS_PER_VISIT = 10;

function ScanContent() {
  const searchParams = useSearchParams();
  const merchantIdParam = searchParams.get('merchantId');

  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const id =
      merchantIdParam ||
      (typeof window !== 'undefined' ? localStorage.getItem('returni_merchant_id') : null);
    setMerchantId(id);

    const loadPending = async () => {
      if (db) {
        const pending = await db.pendingVisits.where('synced').equals(0).count();
        setPendingCount(pending);
      }
    };
    loadPending();
  }, [merchantIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId || !phone.trim()) return;

    setError('');
    setLoading(true);

    const phoneClean = phone.replace(/\D/g, '').slice(-9);
    const fullPhone = phoneClean.length >= 9 ? (phoneClean.startsWith('0') ? phoneClean : `0${phoneClean}`) : phone.trim();

    try {
      const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          customerPhone: fullPhone,
          pointsEarned: POINTS_PER_VISIT,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 500 && navigator.onLine === false) {
          await saveOffline();
          return;
        }
        throw new Error(data.error || 'Failed to record visit');
      }

      setSuccess(true);
      setPhone('');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      if (!navigator.onLine) {
        await saveOffline();
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveOffline = async () => {
    if (!db || !merchantId) return;

    const phoneClean = phone.replace(/\D/g, '').slice(-9);
    const fullPhone = phoneClean.length >= 9 ? (phoneClean.startsWith('0') ? phoneClean : `0${phoneClean}`) : phone.trim();

    await db.pendingVisits.add({
      merchantId,
      customerPhone: fullPhone,
      pointsEarned: POINTS_PER_VISIT,
      createdAt: new Date().toISOString(),
      synced: false,
    });

    setPendingCount((c) => c + 1);
    setSuccess(true);
    setPhone('');
    setError('');
    setTimeout(() => setSuccess(false), 2000);
  };

  const syncPending = async () => {
    if (!db || !merchantId) return;

    const pending = await db.pendingVisits.where('synced').equals(0).toArray();
    if (pending.length === 0) return;

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          pendingVisits: pending.map((p) => ({
            id: p.id,
            customerPhone: p.customerPhone,
            pointsEarned: p.pointsEarned,
          })),
        }),
      });

      const data = await res.json();
      if (data.syncedIds?.length) {
        for (const id of data.syncedIds) {
          await db.pendingVisits.update(id, { synced: true });
        }
        setPendingCount((c) => Math.max(0, c - data.syncedIds.length));
      }
    } catch {
      setError('Sync failed. Will retry when online.');
    }
  };

  useEffect(() => {
    if (!merchantId || !navigator.onLine) return;
    const onOnline = () => syncPending();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [merchantId]);

  if (!merchantId) {
    return (
      <main className="min-h-screen p-6 bg-returni-cream flex flex-col items-center justify-center">
        <p className="text-returni-dark mb-4">No merchant selected.</p>
        <Link href="/merchant/login" className="text-returni-orange underline">
          Log in as merchant
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-returni-cream">
      <Link href="/" className="text-returni-orange text-sm mb-6 inline-block">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold text-returni-dark mb-2">
        Add Points
      </h1>
      <p className="text-returni-dark/70 mb-8">
        Enter your phone number to earn {POINTS_PER_VISIT} loyalty points
      </p>

      {pendingCount > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
          <span className="text-amber-800 text-sm">
            {pendingCount} visit(s) pending sync
          </span>
          <button
            onClick={syncPending}
            className="text-returni-orange text-sm font-medium"
          >
            Sync now
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-returni-dark mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-returni-orange focus:border-transparent text-lg"
            placeholder="0771234567"
            autoFocus
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm font-medium">
            ✓ Points added{navigator.onLine ? '' : ' (will sync when online)'}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-returni-orange text-white font-semibold text-lg hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? 'Adding...' : `Add ${POINTS_PER_VISIT} Points`}
        </button>
      </form>

      <Link
        href="/merchant/dashboard"
        className="block mt-8 text-center text-returni-orange text-sm"
      >
        Merchant Dashboard
      </Link>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-6 bg-returni-cream flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    }>
      <ScanContent />
    </Suspense>
  );
}
