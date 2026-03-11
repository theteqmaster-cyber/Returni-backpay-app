'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchantId) return;
    fetch(`/api/merchant/report?merchantId=${merchantId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [merchantId]);

  if (loading) return (
    <main className="min-h-screen p-6 bg-returni-bg flex items-center justify-center">
      <p className="text-gray-400 animate-pulse">Loading merchant data...</p>
    </main>
  );

  if (!data || data.error) return (
    <main className="min-h-screen p-6 bg-returni-bg flex items-center justify-center">
      <p className="text-red-500">{data?.error || 'Merchant not found.'}</p>
    </main>
  );

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/merchants" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Merchants
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">{data.merchant.business_name}</h1>
        <p className="text-returni-dark/60 text-sm mt-1">{data.merchant.owner_name} • {data.merchant.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-returni-green text-white rounded-2xl p-5 shadow-md shadow-green-600/20">
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Total Transactions</p>
          <p className="text-4xl font-black">{data.summary.totalCount}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Volume</p>
          <p className="text-4xl font-black text-returni-dark">${Number(data.summary.totalVolume).toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Agent</p>
          <p className="text-xl font-black text-returni-blue">{data.agent?.name || '—'}</p>
          {data.agent?.phone && <p className="text-sm text-gray-400 mt-0.5">{data.agent.phone}</p>}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-returni-dark">Transaction History</h2>
        </div>
        {data.transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No transactions yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Time</th>
                <th className="text-right p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx: any, i: number) => {
                const d = new Date(tx.created_at);
                return (
                  <tr key={tx.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="p-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                    <td className="p-4 text-sm font-semibold text-returni-dark">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-sm text-gray-500">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 text-sm font-black text-returni-green text-right">${Number(tx.amount).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
