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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) {
      router.push('/merchant/login');
      return;
    }

    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch(`/api/merchant/report?merchantId=${merchantId}&range=${range}`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : res.json().then(e => { throw e; }))
      .then(d => {
        if (d.error) { setError(d.error); } else { setData(d); }
        setLoading(false);
      })
      .catch((err) => { 
        console.error('Report error:', err);
        setError(err.name === 'AbortError' ? 'Server timed out.' : 'Failed to retrieve audit log.'); 
        setLoading(false); 
      })
      .finally(() => clearTimeout(timeout));
  }, [router, range]);

  const handlePrint = () => window.print();

  // 1. Initial Shell: Simplest possible render to guarantee hydration match
  if (!isMounted || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-returni-dark/40 font-bold animate-pulse text-sm">LOADING SECURE AUDIT...</p>
        </div>
      </main>
    );
  }

  // 2. Error State
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm text-center border border-red-100">
          <p className="text-red-500 font-bold mb-4">{error || 'Data retrieval failed.'}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-returni-dark text-white rounded-xl text-sm font-bold active:scale-95 transition-all">Retry</button>
        </div>
      </main>
    );
  }

  const generatedDate = new Date(data.summary.generatedAt);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Interactive Controls — HIDDEN ON PRINT */}
      <div className="print:hidden flex justify-center gap-4 p-6 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-xl border border-gray-200 bg-white text-returni-dark font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          ← Back
        </button>
        
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-returni-dark font-bold outline-none cursor-pointer"
        >
          <option value="7d">7 Days</option>
          <option value="2w">2 Weeks</option>
          <option value="1m">1 Month</option>
          <option value="all">All Time</option>
        </select>

        <button
          onClick={handlePrint}
          className="px-8 py-2 rounded-xl bg-returni-green text-white font-bold shadow-md shadow-green-600/20 hover:bg-returni-darkGreen active:scale-95 transition-all"
        >
          🖨 Print / PDF
        </button>
      </div>

      {/* Official Document Sheet */}
      <div className="bg-white max-w-3xl mx-auto p-10 my-8 shadow-xl rounded-2xl print:my-0 print:p-0 print:shadow-none print:max-w-none font-sans">
        
        {/* Document Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-returni-green">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={56}
              height={56}
              className="rounded-xl grayscale-[0.2]"
              priority
            />
            <div>
              <h1 className="text-2xl font-black text-returni-green leading-none">RETURNi</h1>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Audit & Compliance</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase">Generated On</p>
            <p className="text-sm font-black text-returni-dark">{generatedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{generatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* MERCHANT HEADER */}
        <div className="mb-10 text-center">
          <p className="text-[10px] font-black text-returni-green uppercase tracking-widest mb-1">Official Sales Report</p>
          <h2 className="text-4xl font-black text-returni-dark tracking-tight">{data.merchant.business_name}</h2>
          <div className="flex justify-center gap-6 mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
             <span className="flex items-center gap-1">Owner: <span className="text-returni-dark">{data.merchant.owner_name}</span></span>
             <span className="flex items-center gap-1">Contact: <span className="text-returni-dark">{data.merchant.phone}</span></span>
          </div>
        </div>

        {/* FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center flex flex-col justify-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Tx</p>
            <p className="text-2xl font-black text-returni-dark">{data.summary.totalCount}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Volume</p>
            <div className="space-y-0.5">
              <p className="text-base font-black text-returni-dark leading-none">${data.summary.totalVolume.USD}</p>
              <p className="text-[9px] font-bold text-gray-400">ZAR {data.summary.totalVolume.ZAR}</p>
              <p className="text-[9px] font-bold text-gray-400 opacity-60">ZiG {data.summary.totalVolume.ZIG}</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Issued</p>
            <div className="space-y-0.5">
              <p className="text-base font-black text-returni-green leading-none">${data.summary.totalBackpayIssued.USD}</p>
              <p className="text-[9px] font-bold text-gray-400">ZAR {data.summary.totalBackpayIssued.ZAR}</p>
              <p className="text-[9px] font-bold text-gray-400 opacity-60">ZiG {data.summary.totalBackpayIssued.ZIG}</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Redeemed</p>
            <div className="space-y-0.5">
              <p className="text-base font-black text-returni-blue leading-none">${data.summary.totalBackpayClaimed.USD}</p>
              <p className="text-[9px] font-bold text-gray-400">ZAR {data.summary.totalBackpayClaimed.ZAR}</p>
              <p className="text-[9px] font-bold text-gray-400 opacity-60">ZiG {data.summary.totalBackpayClaimed.ZIG}</p>
            </div>
          </div>
        </div>

        {/* AUDIT LOG TABLE */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
                <tr className="bg-gray-100 print:bg-transparent print:border-b-2 print:border-returni-dark">
                  <th className="p-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Date/Time</th>
                  <th className="p-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Tx Amount</th>
                  <th className="p-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">BackPay</th>
                  <th className="p-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-500">Loop Status</th>
                  <th className="p-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Merchant Notes</th>
                  <th className="p-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-500 pr-4">Traceability</th>
                </tr>
            </thead>
            <tbody>
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">
                    No Audit Records Found
                  </td>
                </tr>
              ) : (
                data.transactions.map((tx, i) => {
                  const d = new Date(tx.created_at);
                  const bp = tx.backpay_details;
                  return (
                    <tr key={tx.id} className="border-b border-gray-100 print:border-gray-200">
                      <td className="p-3">
                        <p className="text-sm font-black text-returni-dark leading-none">
                          {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-3 text-sm font-black text-returni-dark">
                         {tx.currency === 'ZAR' ? 'R ' : tx.currency === 'ZIG' ? 'ZiG ' : '$'}
                         {Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="p-3">
                         {bp ? (
                           <p className="text-sm font-black text-returni-green">
                             {tx.currency === 'ZAR' ? 'R ' : tx.currency === 'ZIG' ? 'ZiG ' : '$'}
                             {Number(bp.backpay_amount).toFixed(2)}
                           </p>
                         ) : '-'}
                      </td>
                      <td className="p-3 text-center">
                         {bp ? (
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${bp.status === 'claimed' ? 'bg-blue-50 text-returni-blue' : 'bg-green-50 text-returni-green'}`}>
                              {bp.status === 'claimed' ? 'Redeemed' : 'Active'}
                           </span>
                         ) : '-'}
                      </td>
                      <td className="p-3 truncate max-w-[120px] text-[10px] text-gray-500 font-medium italic overflow-hidden">
                        {tx.merchant_notes || '-'}
                      </td>
                      <td className="p-3 text-right pr-4">
                         <p className="text-[10px] font-black text-gray-400 leading-none">
                           {tx.payment_method || 'CASH'}
                         </p>
                         {tx.customer_phone && (
                           <p className="text-[9px] font-bold text-returni-dark opacity-50 mt-1">
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
                {/* Triple Sumary Totals */}
                <tr className="border-t-2 border-returni-dark bg-gray-50/50 print:bg-transparent">
                  <td colSpan={4} className="p-4 text-[10px] font-black text-returni-dark uppercase tracking-widest text-right">Aggregate Sales Volume</td>
                  <td colSpan={2} className="p-4 border-l border-gray-200">
                     <div className="flex flex-col items-end gap-0.5">
                        <span className="text-lg font-black text-returni-dark">${data.summary.totalVolume.USD}</span>
                        <span className="text-[10px] font-bold text-gray-400">ZAR {data.summary.totalVolume.ZAR}</span>
                        <span className="text-[10px] font-bold text-gray-400/60 font-mono">ZiG {data.summary.totalVolume.ZIG}</span>
                     </div>
                  </td>
                </tr>
                <tr className="bg-green-50/20 print:bg-transparent">
                  <td colSpan={4} className="p-4 text-[10px] font-black text-returni-green uppercase tracking-widest text-right">Total Rewards Issued</td>
                  <td colSpan={2} className="p-4 border-l border-gray-200">
                     <div className="flex flex-col items-end gap-0.5">
                        <span className="text-lg font-black text-returni-green">${data.summary.totalBackpayIssued.USD}</span>
                        <span className="text-[10px] font-bold text-gray-400">ZAR {data.summary.totalBackpayIssued.ZAR}</span>
                        <span className="text-[10px] font-bold text-gray-400/60 font-mono">ZiG {data.summary.totalBackpayIssued.ZIG}</span>
                     </div>
                  </td>
                </tr>
                <tr className="bg-blue-50/20 print:bg-transparent border-b-2 border-returni-dark">
                  <td colSpan={4} className="p-4 text-[10px] font-black text-returni-blue uppercase tracking-widest text-right">Total Rewards Redeemed</td>
                  <td colSpan={2} className="p-4 border-l border-gray-200">
                     <div className="flex flex-col items-end gap-0.5">
                        <span className="text-lg font-black text-returni-blue">${data.summary.totalBackpayClaimed.USD}</span>
                        <span className="text-[10px] font-bold text-gray-400">ZAR {data.summary.totalBackpayClaimed.ZAR}</span>
                        <span className="text-[10px] font-bold text-gray-400/60 font-mono">ZiG {data.summary.totalBackpayClaimed.ZIG}</span>
                     </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* DOCUMENT FOOTER */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          <p>Securely verified by RETURNi™ Audit Protocol</p>
          <p className="text-returni-green">Confidence in every transaction</p>
        </div>
      </div>
    </div>
  );
}
