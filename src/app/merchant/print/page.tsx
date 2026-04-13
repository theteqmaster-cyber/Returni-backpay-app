'use client';

import { useEffect, useState } from 'react';
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
    totalVolume: { USD: string, ZAR: string, ZIG: string };
    totalBackpayIssued: { USD: string, ZAR: string, ZIG: string };
    totalBackpayClaimed: { USD: string, ZAR: string, ZIG: string };
    generatedAt: string;
  };
}

export default function MerchantPrintPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) {
      router.push('/merchant/login');
      return;
    }

    setLoading(true);
    fetch(`/api/merchant/report?merchantId=${merchantId}&range=${range}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) { setError(d.error); } else { setData(d); }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load report.'); setLoading(false); });
  }, [router, range]);

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
        
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-returni-dark font-bold focus:ring-2 focus:ring-returni-green outline-none transition-all cursor-pointer"
        >
          <option value="7d">Last 7 Days</option>
          <option value="2w">Last 2 Weeks</option>
          <option value="1m">Last 1 Month</option>
          <option value="all">All Time</option>
        </select>

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
          <div className="bg-returni-green/10 border border-returni-green/30 rounded-2xl p-5 text-center flex flex-col justify-center">
            <p className="text-[10px] font-extrabold text-returni-green uppercase tracking-widest mb-1">Total Tx</p>
            <p className="text-3xl font-black text-returni-green">{data.summary.totalCount}</p>
          </div>
          <div className="bg-returni-dark/5 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Volume</p>
            <div className="space-y-1">
              <p className="text-lg font-black text-returni-dark leading-none">${Number(data.summary.totalVolume.USD).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400">ZAR {Number(data.summary.totalVolume.ZAR).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400/60">ZiG {Number(data.summary.totalVolume.ZIG).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-returni-dark/5 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Rewards Issued</p>
            <div className="space-y-1">
              <p className="text-lg font-black text-returni-green leading-none">${Number(data.summary.totalBackpayIssued.USD).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400">ZAR {Number(data.summary.totalBackpayIssued.ZAR).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400/60">ZiG {Number(data.summary.totalBackpayIssued.ZIG).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-returni-dark/5 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Rewards Redeemed</p>
            <div className="space-y-1">
              <p className="text-lg font-black text-returni-blue leading-none">${Number(data.summary.totalBackpayClaimed.USD).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400">ZAR {Number(data.summary.totalBackpayClaimed.ZAR).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-400/60">ZiG {Number(data.summary.totalBackpayClaimed.ZIG).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div>
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 italic">Detailed Audit Log</h3>
          <div className="overflow-x-auto -mx-10 px-10 md:mx-0 md:px-0 scrollbar-hide">
            <table className="w-full border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-returni-dark text-white">
                  <th className="text-left text-xs font-bold uppercase tracking-wider p-3 rounded-tl-lg">#</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider p-3">Date</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider p-3 whitespace-nowrap">Tx Amount</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider p-3 whitespace-nowrap">BackPay</th>
                  <th className="text-center text-xs font-bold uppercase tracking-wider p-3 whitespace-nowrap">Loop Status</th>
                  <th className="text-right text-xs font-bold uppercase tracking-wider p-3 rounded-tr-lg">Method</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 font-medium italic text-sm">
                      No records discovered for this period.
                    </td>
                  </tr>
                ) : (
                  data.transactions.map((tx, i) => {
                    const d = new Date(tx.created_at);
                    const bp = tx.backpay_details;
                    return (
                      <tr key={tx.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                        <td className="p-3">
                          <p className="text-sm text-returni-dark font-semibold">
                            {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-[9px] text-gray-400 uppercase font-black">
                             {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="p-3 text-sm text-returni-dark font-black">
                          {tx.currency === 'ZAR' ? 'ZAR ' : tx.currency === 'ZIG' ? 'ZiG ' : '$'}
                          {Number(tx.amount).toFixed(2)}
                        </td>
                        <td className="p-3">
                          {bp ? (
                            <p className="text-sm text-returni-green font-black">
                              {tx.currency === 'ZAR' ? 'ZAR ' : tx.currency === 'ZIG' ? 'ZiG ' : '$'}
                              {Number(bp.backpay_amount).toFixed(2)}
                            </p>
                          ) : '-'}
                        </td>
                        <td className="p-3 text-center">
                           {bp ? (
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${bp.status === 'claimed' ? 'bg-blue-100 text-returni-blue' : 'bg-green-100 text-green-600'}`}>
                               {bp.status === 'claimed' ? 'Redeemed' : 'Active'}
                             </span>
                           ) : '-'}
                        </td>
                        <td className="p-3 text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase leading-none">
                            {tx.payment_method || 'CASH'}
                          </p>
                          {tx.customer_phone && (
                            <p className="text-[10px] text-gray-500 font-bold mt-1 opacity-70">
                               {tx.customer_phone}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {data.transactions.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-returni-dark bg-gray-50/50">
                    <td colSpan={4} className="p-4 text-sm font-extrabold text-returni-dark uppercase tracking-wider text-right">TOTAL VOLUME</td>
                    <td colSpan={2} className="p-4 border-l border-gray-200">
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-lg font-black text-returni-dark">${Number(data.summary.totalVolume.USD).toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400">ZAR {Number(data.summary.totalVolume.ZAR).toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400/60 font-mono">ZiG {Number(data.summary.totalVolume.ZIG).toLocaleString()}</span>
                       </div>
                    </td>
                  </tr>
                  <tr className="bg-green-50/20">
                    <td colSpan={4} className="p-4 text-sm font-extrabold text-returni-green uppercase tracking-wider text-right">REWARDS ISSUED</td>
                    <td colSpan={2} className="p-4 border-l border-gray-200">
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-lg font-black text-returni-green">${Number(data.summary.totalBackpayIssued.USD).toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400">ZAR {Number(data.summary.totalBackpayIssued.ZAR).toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400/60 font-mono">ZiG {Number(data.summary.totalBackpayIssued.ZIG).toLocaleString()}</span>
                       </div>
                    </td>
                  </tr>
                  <tr className="bg-blue-50/20">
                    <td colSpan={4} className="p-4 text-sm font-extrabold text-returni-blue uppercase tracking-wider text-right">REWARDS REDEEMED</td>
                    <td colSpan={2} className="p-4 border-l border-gray-200">
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-lg font-black text-returni-blue">${Number(data.summary.totalBackpayClaimed.USD).toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400">ZAR {Number(data.summary.totalBackpayClaimed.ZAR).toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400/60 font-mono">ZiG {Number(data.summary.totalBackpayClaimed.ZIG).toLocaleString()}</span>
                       </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-400">Certified statement generated securely via RETURNi High-Trust Protocol. All rewards reflect real-time audit logs.</p>
          <p className="text-xs font-bold text-returni-green whitespace-nowrap ml-4">© 2026 RETURNi</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-shadow { box-shadow: none !important; border-radius: 0 !important; }
          body { background: white !important; }
          .printable-page { margin: 0 !important; max-width: 100% !important; padding: 20px !important; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
