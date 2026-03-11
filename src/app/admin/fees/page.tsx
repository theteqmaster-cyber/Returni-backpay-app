'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminFeesPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/merchants')
      .then(r => r.json())
      .then(d => { setMerchants(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  // For MVP, fees are $10/month per merchant. Status is hardcoded 'Unpaid' for all initially.
  // This page shows the outstanding fee table.
  const totalOutstanding = merchants.length * 10;

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">Platform Fees</h1>
        <p className="text-returni-dark/60 text-sm mt-1">Monthly $5 fee status per merchant</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Merchants</p>
          <p className="text-3xl font-black text-returni-dark">{merchants.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Outstanding Fees</p>
          <p className="text-3xl font-black text-orange-600">${totalOutstanding}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fee Per Merchant</p>
          <p className="text-3xl font-black text-returni-dark">$10<span className="text-base font-semibold text-gray-400">/mo</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-returni-dark">Fee Status</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : merchants.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No merchants found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4">Merchant</th>
                <th className="text-left p-4">Email</th>
                <th className="text-center p-4">Monthly Fee</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m: any, i: number) => (
                <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="p-4">
                    <Link href={`/admin/merchants/${m.id}`} className="font-bold text-returni-dark hover:text-returni-green transition-colors">{m.business_name}</Link>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{m.email}</td>
                  <td className="p-4 text-sm font-black text-returni-dark text-center">$10.00</td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-lg border border-red-100">Unpaid</span>
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
