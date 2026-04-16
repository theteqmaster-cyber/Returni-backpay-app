'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ReportData {
  merchant: {
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
  };
  agent: { name: string; phone: string } | null;
  transactions: {
    id: string;
    amount: string;
    currency: string;
    payment_method?: string;
    merchant_notes?: string;
    created_at: string;
    backpay_details?: { backpay_amount: string; status: string };
    customer_phone?: string;
  }[];
  summary: {
    totalCount: number;
    totalVolume: { USD: string; ZAR: string; ZIG: string };
    totalBackpayIssued: { USD: string; ZAR: string; ZIG: string };
    totalBackpayClaimed: { USD: string; ZAR: string; ZIG: string };
    generatedAt: string;
  };
}

export default function PrintReportPanel() {
  const [data, setData] = useState<ReportData | null>(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) return;

    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch(`/api/merchant/report?merchantId=${merchantId}&range=${range}`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : res.json().then(e => { throw e; })))
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.name === 'AbortError' ? 'Server timed out.' : 'Failed to load report.');
        setLoading(false);
      })
      .finally(() => clearTimeout(timeout));
  }, [range]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 px-4">
        <div className="w-7 h-7 border-4 border-returni-green/20 border-t-returni-green rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-returni-dark/30">Loading Audit...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-red-400 font-bold text-sm mb-3">{error || 'Data retrieval failed.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-returni-dark text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const currencyPrefix = (c: string) => (c === 'ZAR' ? 'R ' : c === 'ZIG' ? 'ZiG ' : '$');

  return (
    <div className="px-4 pb-8 space-y-4">
      {/* Range selector + open full report link */}
      <div className="flex items-center justify-between gap-3 sticky top-[57px] bg-returni-bg py-2 z-10">
        <select
          value={range}
          onChange={e => setRange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-returni-dark text-xs font-bold outline-none cursor-pointer"
        >
          <option value="7d">7 Days</option>
          <option value="2w">2 Weeks</option>
          <option value="1m">1 Month</option>
          <option value="all">All Time</option>
        </select>
        <Link
          href="/merchant/print"
          className="text-[10px] font-black text-returni-green uppercase tracking-widest hover:underline flex items-center gap-1"
        >
          Full Report →
        </Link>
      </div>

      {/* Business name */}
      <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-returni-green mb-0.5">Official Sales Report</p>
        <h2 className="text-base font-black text-returni-dark truncate">{data.merchant.business_name}</h2>
        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{data.merchant.owner_name} · {data.merchant.phone}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total Tx', value: data.summary.totalCount.toString(), color: 'text-returni-dark' },
          { label: 'Volume', value: `$${data.summary.totalVolume.USD}`, sub: `ZAR ${data.summary.totalVolume.ZAR}`, color: 'text-returni-dark' },
          { label: 'Issued', value: `$${data.summary.totalBackpayIssued.USD}`, sub: `ZAR ${data.summary.totalBackpayIssued.ZAR}`, color: 'text-returni-green' },
          { label: 'Redeemed', value: `$${data.summary.totalBackpayClaimed.USD}`, sub: `ZAR ${data.summary.totalBackpayClaimed.ZAR}`, color: 'text-returni-blue' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className={`text-sm font-black ${card.color} leading-none`}>{card.value}</p>
            {card.sub && <p className="text-[8px] font-bold text-gray-400 mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[320px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-2.5 text-left text-[8px] font-black uppercase tracking-wider text-gray-400">Date</th>
                <th className="p-2.5 text-left text-[8px] font-black uppercase tracking-wider text-gray-400">Amount</th>
                <th className="p-2.5 text-left text-[8px] font-black uppercase tracking-wider text-gray-400">BackPay</th>
                <th className="p-2.5 text-center text-[8px] font-black uppercase tracking-wider text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[9px] text-gray-300 font-black uppercase tracking-widest">
                    No Records Found
                  </td>
                </tr>
              ) : (
                data.transactions.map(tx => {
                  const d = new Date(tx.created_at);
                  const bp = tx.backpay_details;
                  return (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-2.5">
                        <p className="text-[10px] font-black text-returni-dark leading-none">
                          {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 mt-0.5">
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-2.5 text-[10px] font-black text-returni-dark">
                        {currencyPrefix(tx.currency)}{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-[10px] font-black text-returni-green">
                        {bp ? `${currencyPrefix(tx.currency)}${Number(bp.backpay_amount).toFixed(2)}` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="p-2.5 text-center">
                        {bp ? (
                          <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${bp.status === 'claimed' ? 'bg-blue-50 text-returni-blue' : 'bg-green-50 text-returni-green'}`}>
                            {bp.status === 'claimed' ? 'Redeemed' : 'Active'}
                          </span>
                        ) : <span className="text-gray-200 text-[9px]">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {data.transactions.length > 0 && (
          <div className="border-t-2 border-returni-dark bg-gray-50/50 px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-returni-dark uppercase tracking-widest">Total Volume</span>
              <span className="text-sm font-black text-returni-dark">${data.summary.totalVolume.USD}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-returni-green uppercase tracking-widest">Rewards Issued</span>
              <span className="text-sm font-black text-returni-green">${data.summary.totalBackpayIssued.USD}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-returni-blue uppercase tracking-widest">Rewards Redeemed</span>
              <span className="text-sm font-black text-returni-blue">${data.summary.totalBackpayClaimed.USD}</span>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/merchant/print"
        className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-returni-dark/70 font-semibold text-center flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-colors text-xs"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Open Full Report & Print
      </Link>
    </div>
  );
}
