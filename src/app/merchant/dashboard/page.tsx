'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Stats = {
  totalVisits: number;
  todayVisits: number;
  weekVisits: number;
  totalPointsGiven: number;
  uniqueCustomers: number;
  recentVisits: { id: string; created_at: string; points_earned: number }[];
};

export default function MerchantDashboardPage() {
  const router = useRouter();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('returni_merchant_id');
    const name = localStorage.getItem('returni_merchant_name');

    if (!id) {
      router.push('/merchant/login');
      return;
    }

    setMerchantId(id);
    setMerchantName(name || 'My Business');

    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?merchantId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        setStats({
          totalVisits: 0,
          todayVisits: 0,
          weekVisits: 0,
          totalPointsGiven: 0,
          uniqueCustomers: 0,
          recentVisits: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading || !merchantId) {
    return (
      <main className="min-h-screen p-6 bg-returni-cream flex items-center justify-center">
        <div className="animate-pulse text-returni-dark">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-returni-cream">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-returni-orange text-sm">
          ← Home
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('returni_merchant_id');
            localStorage.removeItem('returni_merchant_name');
            router.push('/merchant/login');
          }}
          className="text-returni-dark/60 text-sm"
        >
          Log out
        </button>
      </div>

      <h1 className="text-2xl font-bold text-returni-dark mb-1">
        {merchantName}
      </h1>
      <p className="text-returni-dark/60 text-sm mb-8">Merchant Dashboard</p>

      <div className="flex gap-3 mb-8">
        <Link
          href={`/scan?merchantId=${merchantId}`}
          className="flex-1 py-4 px-6 rounded-xl bg-returni-orange text-white font-semibold text-center shadow-lg hover:bg-orange-600 transition"
        >
          Add Points
        </Link>
        <Link
          href="/merchant/qr"
          className="flex-1 py-4 px-6 rounded-xl border-2 border-returni-orange text-returni-orange font-semibold text-center hover:bg-orange-50 transition"
        >
          My QR Code
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-returni-dark/60 text-sm">Today</p>
          <p className="text-2xl font-bold text-returni-orange">
            {stats?.todayVisits ?? 0}
          </p>
          <p className="text-xs text-returni-dark/50">visits</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-returni-dark/60 text-sm">This Week</p>
          <p className="text-2xl font-bold text-returni-orange">
            {stats?.weekVisits ?? 0}
          </p>
          <p className="text-xs text-returni-dark/50">visits</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-returni-dark/60 text-sm">Total Visits</p>
          <p className="text-2xl font-bold text-returni-orange">
            {stats?.totalVisits ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-returni-dark/60 text-sm">Unique Customers</p>
          <p className="text-2xl font-bold text-returni-orange">
            {stats?.uniqueCustomers ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-returni-dark mb-4">Total Points Given</h2>
        <p className="text-3xl font-bold text-returni-orange">
          {stats?.totalPointsGiven ?? 0}
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-returni-dark mb-4">Recent Visits</h2>
        {stats?.recentVisits?.length ? (
          <ul className="space-y-2">
            {stats.recentVisits.map((v) => (
              <li
                key={v.id}
                className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-returni-dark/80 text-sm">
                  {new Date(v.created_at).toLocaleString()}
                </span>
                <span className="text-returni-orange font-medium">
                  +{v.points_earned} pts
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-returni-dark/50 text-sm">No visits yet</p>
        )}
      </div>
    </main>
  );
}
