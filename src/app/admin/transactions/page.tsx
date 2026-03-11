'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState('0.00');
  const [filters, setFilters] = useState({ merchant_id: '', from: '', to: '' });

  const applyFilters = (f: typeof filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.merchant_id) params.set('merchant_id', f.merchant_id);
    if (f.from) params.set('from', f.from);
    if (f.to) params.set('to', f.to);
    fetch(`/api/admin/transactions?${params}`)
      .then(r => r.json())
      .then(d => { setTransactions(d.transactions || []); setTotal(d.total || '0.00'); setLoading(false); });
  };

  useEffect(() => {
    fetch('/api/admin/merchants').then(r => r.json()).then(d => setMerchants(Array.isArray(d) ? d : []));
    applyFilters(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => { e.preventDefault(); applyFilters(filters); };

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">Transaction Log</h1>
        <p className="text-returni-dark/60 text-sm mt-1">All transactions across every merchant</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Merchant</label>
          <select value={filters.merchant_id} onChange={e => setFilters({ ...filters, merchant_id: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-returni-green outline-none">
            <option value="">All Merchants</option>
            {merchants.map((m: any) => <option key={m.id} value={m.id}>{m.business_name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">From</label>
          <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-returni-green outline-none" />
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">To</label>
          <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-returni-green outline-none" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-5 py-2 bg-returni-green text-white font-bold rounded-xl text-sm hover:bg-returni-darkGreen transition-colors">Apply</button>
          <button type="button" onClick={() => { const cleared = { merchant_id: '', from: '', to: '' }; setFilters(cleared); applyFilters(cleared); }} className="px-5 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">Clear</button>
          <a href="/api/admin/export" className="px-5 py-2 bg-returni-dark text-white font-bold rounded-xl text-sm hover:bg-black transition-colors">⬇ CSV</a>
        </div>
      </form>

      {/* Total */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <p className="text-sm text-gray-400 font-medium">{loading ? '...' : `${transactions.length} transactions`}</p>
        <div className="flex gap-4 items-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Volumes:</span>
            <span className="text-lg font-black text-returni-dark">${loading ? '0.00' : (total as any)?.USD ?? '0.00'}</span>
            <span className="text-md font-bold text-returni-dark/70 bg-gray-100 px-3 py-1 rounded-md">ZAR {loading ? '0.00' : (total as any)?.ZAR ?? '0.00'}</span>
            <span className="text-md font-bold text-returni-dark/70 bg-gray-100 px-3 py-1 rounded-md">ZiG {loading ? '0.00' : (total as any)?.ZIG ?? '0.00'}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No transactions matched your filters.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4">Merchant</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Time</th>
                <th className="text-center p-4">Method</th>
                <th className="text-right p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any, i: number) => {
                const d = new Date(tx.created_at);
                return (
                  <tr key={tx.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="p-4 text-sm font-semibold text-returni-dark">{(tx.merchant as any)?.business_name || '—'}</td>
                    <td className="p-4 text-sm text-returni-dark">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-sm text-gray-500">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">{tx.payment_method || 'CASH'}</td>
                    <td className="p-4 text-sm font-black text-returni-green text-right">
                       {tx.currency === 'ZAR' ? 'ZAR ' : tx.currency === 'ZIG' ? 'ZiG ' : '$'}
                       {Number(tx.amount).toFixed(2)}
                    </td>
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
