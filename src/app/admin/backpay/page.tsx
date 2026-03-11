'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminBackpayPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformTotal, setPlatformTotal] = useState(0);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        setPlatformTotal(Number(d.totalBackpayLiability || 0));
      });

    // Get all merchants then fetch backpay per merchant
    fetch('/api/admin/merchants')
      .then(r => r.json())
      .then(async (ms) => {
        if (!Array.isArray(ms)) { setLoading(false); return; }
        const withBackpay = await Promise.all(ms.map(async (m: any) => {
          const res = await fetch(`/api/stats?merchantId=${m.id}`);
          const s = await res.json();
          return { ...m, unclaimedLiability: Number(s.unclaimedLiability || 0) };
        }));
        withBackpay.sort((a, b) => b.unclaimedLiability - a.unclaimedLiability);
        setMerchants(withBackpay);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">Backpay Liability</h1>
        <p className="text-returni-dark/60 text-sm mt-1">Unclaimed backpay owed to customers across all merchants</p>
      </div>

      {/* Platform total */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Total Platform Exposure</p>
          <p className="text-4xl font-black text-red-600">${platformTotal.toLocaleString()}</p>
          <p className="text-xs text-red-400 mt-0.5">Total unclaimed backpay owed to all customers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-returni-dark">Per Merchant Breakdown (Ranked by Liability)</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {merchants.map((m, i) => (
              <div key={m.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-300 w-6">{i + 1}</span>
                  <div>
                    <Link href={`/admin/merchants/${m.id}`} className="font-bold text-returni-dark hover:text-returni-green transition-colors">{m.business_name}</Link>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${m.unclaimedLiability > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${m.unclaimedLiability.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">{m.unclaimedLiability > 0 ? 'unclaimed' : 'all clear'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
