'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/commissions')
      .then(r => r.json())
      .then(d => { setCommissions(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(load, []);

  const markPaid = async (id: string) => {
    setMarkingId(id);
    await fetch('/api/admin/commissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setMarkingId(null);
    load();
  };

  const pendingTotal = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.commission_amount), 0);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">Agent Commissions</h1>
        <p className="text-returni-dark/60 text-sm mt-1">Review and mark agent commission payouts</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Pending Payouts</p>
          <p className="text-3xl font-black text-orange-600">${pendingTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Records</p>
          <p className="text-3xl font-black text-returni-dark">{commissions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-returni-dark">Commission Records</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : commissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 font-medium">No commissions recorded yet.</p>
            <p className="text-gray-300 text-sm mt-2">Commission records are created from agent_commissions table in your database.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4">Agent</th>
                <th className="text-left p-4">Merchant</th>
                <th className="text-left p-4">Month</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-center p-4">Status</th>
                <th className="text-center p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c: any, i: number) => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="p-4 text-sm font-bold text-returni-dark">{c.agent?.users?.full_name || '—'}</td>
                  <td className="p-4 text-sm text-gray-600">{c.merchant?.business_name || '—'}</td>
                  <td className="p-4 text-sm text-gray-500">{c.month}</td>
                  <td className="p-4 text-sm font-black text-returni-dark text-right">${Number(c.commission_amount).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                      c.status === 'paid'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-orange-50 text-orange-500 border-orange-100'
                    }`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    {c.status === 'pending' ? (
                      <button
                        onClick={() => markPaid(c.id)}
                        disabled={markingId === c.id}
                        className="text-xs font-bold bg-returni-green text-white px-3 py-1.5 rounded-lg hover:bg-returni-darkGreen transition-colors disabled:opacity-50"
                      >
                        {markingId === c.id ? '...' : 'Mark Paid'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">✓ Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
