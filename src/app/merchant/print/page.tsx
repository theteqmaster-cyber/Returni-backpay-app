'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ReportData {
  merchant: {
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
  };
  agent: { name: string; phone: string } | null;
  transactions: { id: string; amount: string; currency: string; payment_method?: string; merchant_notes?: string; created_at: string }[];
  summary: {
    totalCount: number;
    totalVolume: { USD: string, ZAR: string, ZIG: string };
    generatedAt: string;
  };
}

export default function MerchantPrintPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) {
      router.push('/merchant/login');
      return;
    }

    fetch(`/api/merchant/report?merchantId=${merchantId}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) { setError(d.error); } else { setData(d); }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load report.'); setLoading(false); });
  }, [router]);

  const handlePrint = () => window.print();

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center bg-returni-bg">
      <p className="text-returni-dark/60 font-medium animate-pulse">Generating your report...</p>
    </main>
  );

  if (error || !data) return (
    <main className="min-h-screen flex items-center justify-center bg-returni-bg">
      <p className="text-red-500 font-medium">{error || 'Could not load report.'}</p>
    </main>
  );

  const generatedDate = new Date(data.summary.generatedAt);

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="no-print flex justify-center gap-4 p-6 bg-returni-bg border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-returni-dark font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="px-8 py-2 rounded-xl bg-returni-green text-white font-bold shadow-md shadow-green-600/30 hover:bg-returni-darkGreen transition-colors"
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* Print-ready Document */}
      <div className="printable-page bg-white max-w-3xl mx-auto p-10 my-8 shadow-lg rounded-2xl no-print-shadow font-sans">

        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-3 pb-6 border-b-4 border-returni-green">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="RETURNi Logo"
              width={64}
              height={64}
              className="rounded-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <h1 className="text-3xl font-black text-returni-green leading-none tracking-tight">RETURNi</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5 tracking-wide">Customer Retention Platform</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Generated</p>
            <p className="text-sm font-bold text-returni-dark">{generatedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-gray-400">{generatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Report Title */}
        <div className="my-6 text-center">
          <p className="text-xs font-bold text-returni-green uppercase tracking-widest mb-1">Official Sales Statement</p>
          <h2 className="text-4xl font-black text-returni-dark leading-tight">
            {data.merchant.business_name}
          </h2>
        </div>

        {/* Merchant + Agent Info */}
        <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
          <div>
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Merchant Details</p>
            <p className="font-bold text-returni-dark text-base">{data.merchant.owner_name}</p>
            {data.merchant.email && <p className="text-sm text-gray-500">{data.merchant.email}</p>}
            {data.merchant.phone && <p className="text-sm text-gray-500">{data.merchant.phone}</p>}
          </div>
          {data.agent && (
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Responsible Agent</p>
              <p className="font-bold text-returni-dark text-base">{data.agent.name}</p>
              {data.agent.phone && <p className="text-sm text-gray-500">{data.agent.phone}</p>}
            </div>
          )}
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-returni-green/10 border border-returni-green/30 rounded-2xl p-5 text-center col-span-4 md:col-span-1">
            <p className="text-[10px] font-extrabold text-returni-green uppercase tracking-widest mb-1">Total Tx</p>
            <p className="text-3xl font-black text-returni-green">{data.summary.totalCount}</p>
          </div>
          <div className="bg-returni-dark/5 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">USD Volume</p>
            <p className="text-xl font-black text-returni-dark">${Number(data.summary.totalVolume.USD).toLocaleString()}</p>
          </div>
          <div className="bg-returni-dark/5 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">ZAR Volume</p>
            <p className="text-xl font-black text-returni-dark">ZAR {Number(data.summary.totalVolume.ZAR).toLocaleString()}</p>
          </div>
          <div className="bg-returni-dark/5 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">ZiG Volume</p>
            <p className="text-xl font-black text-returni-dark">ZiG {Number(data.summary.totalVolume.ZIG).toLocaleString()}</p>
          </div>
        </div>

        {/* Transaction Table */}
        <div>
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Transaction History</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-returni-dark text-white">
                <th className="text-left text-xs font-bold uppercase tracking-wider p-3 rounded-tl-lg">#</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider p-3">Date</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider p-3">Time</th>
                <th className="text-center text-xs font-bold uppercase tracking-wider p-3">Method</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider p-3">Notes</th>
                <th className="text-right text-xs font-bold uppercase tracking-wider p-3 rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 font-medium italic text-sm">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                data.transactions.map((tx, i) => {
                  const d = new Date(tx.created_at);
                  return (
                    <tr key={tx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                      <td className="p-3 text-sm text-returni-dark font-semibold">
                        {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 text-xs font-bold text-gray-400 uppercase text-center whitespace-nowrap">
                         {tx.payment_method || 'CASH'}
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-medium italic break-words max-w-[150px]">
                         {tx.merchant_notes ? tx.merchant_notes : '-'}
                      </td>
                      <td className="p-3 text-sm text-returni-green font-black text-right whitespace-nowrap">
                        {tx.currency === 'ZAR' ? 'ZAR ' : tx.currency === 'ZIG' ? 'ZiG ' : '$'}
                        {Number(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {data.transactions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-returni-dark">
                  <td colSpan={5} className="p-3 text-sm font-extrabold text-returni-dark uppercase tracking-wider text-right">TOTAL USD</td>
                  <td className="p-3 text-lg font-black text-returni-green text-right border-l border-gray-200">
                    ${Number(data.summary.totalVolume.USD).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-3 pb-3 text-sm font-extrabold text-returni-dark uppercase tracking-wider text-right">TOTAL ZAR</td>
                  <td className="px-3 pb-3 text-lg font-black text-returni-green text-right border-l border-gray-200">
                    ZAR {Number(data.summary.totalVolume.ZAR).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-3 pb-3 text-sm font-extrabold text-returni-dark uppercase tracking-wider text-right">TOTAL ZIG</td>
                  <td className="px-3 pb-3 text-lg font-black text-returni-green text-right border-l border-gray-200">
                    ZiG {Number(data.summary.totalVolume.ZIG).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-400">This document was generated by the RETURNi platform. It is an official record of transactions processed through the system.</p>
          <p className="text-xs font-bold text-returni-green whitespace-nowrap ml-4">© 2026 RETURNi</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-shadow { box-shadow: none !important; border-radius: 0 !important; }
          body { background: white !important; }
          .printable-page { margin: 0 !important; max-width: 100% !important; padding: 20px !important; }
        }
      `}</style>
    </>
  );
}
