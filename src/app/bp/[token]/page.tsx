'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple page that loads when the deep link /bp/TOKEN is clicked
// Customers see their code.
export default function BackpayTokenPage({ params }: { params: { token: string } }) {
  const [details, setDetails] = useState<{
    merchant_name: string;
    date: string;
    amount: number;
    currency: string;
    notes: string;
    backpay_amount: number;
    status: string;
    expires_at: string;
    short_code: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/backpay/${params.token}`);
        if (!res.ok) throw new Error('Failed to load receipt');
        const data = await res.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [params.token]);

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'ZAR') return 'ZAR ';
    if (cur === 'ZIG') return 'ZiG ';
    return '$';
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center justify-center">
        <div className="animate-pulse text-returni-green font-bold text-xl">Loading your receipt...</div>
      </main>
    );
  }

  if (error || !details) {
    return (
      <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm">
          <p className="text-red-500 font-bold mb-4">Oops! {error || 'Receipt not found'}</p>
          <Link href="/" className="text-returni-blue font-bold">Return Home</Link>
        </div>
      </main>
    );
  }

  const sym = getCurrencySymbol(details.currency);
  const isExpired = details.expires_at && new Date(details.expires_at) < new Date();
  const isClaimed = details.status === 'claimed';

  return (
    <main className="min-h-screen p-6 bg-[#f8fafc] flex flex-col items-center pt-8 pb-16">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-sm w-full overflow-hidden flex flex-col">
        
        {/* Receipt Header */}
        <div className="bg-returni-dark p-8 text-center text-white relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full mt-2"></div>
          <h1 className="text-xl font-black tracking-tight mb-1 uppercase">{details.merchant_name}</h1>
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase">E-Receipt</p>
          
          <div className="mt-6">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Paid</p>
            <p className="text-4xl font-black tracking-tighter">{sym}{details.amount}</p>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-8 space-y-8 relative">
          {/* Decorative semi-circles for receipt look */}
          <div className="absolute -top-3 left-0 w-full flex justify-between px-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-white rounded-full"></div>
            ))}
          </div>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-bold text-returni-dark">{new Date(details.date).toLocaleDateString()} {new Date(details.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${isClaimed ? 'bg-green-50 text-green-600 border-green-100' : isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {isClaimed ? 'Claimed' : isExpired ? 'Expired' : 'Active'}
              </p>
            </div>
          </div>

          <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Purchase Details</p>
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <p className="text-sm font-medium text-returni-dark leading-relaxed italic">
                 &ldquo;{details.notes || 'General Purchase'}&rdquo;
               </p>
             </div>
          </div>

          <div className="pt-6 border-t border-dashed border-gray-200">
            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-returni-green/5 rounded-full -mr-8 -mt-8"></div>
               <p className="text-[10px] font-black text-returni-green uppercase tracking-[0.2em] mb-2">Backpay Earned</p>
               <p className="text-4xl font-black text-returni-dark tracking-tighter">{sym}{details.backpay_amount}</p>
               <p className="text-[10px] text-returni-green/60 font-bold mt-2">Added to your RETURNi balance</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Redemption Code</p>
            <div className="inline-block bg-white border-2 border-returni-dark p-4 px-8 rounded-2xl shadow-sm">
              <p className="text-4xl font-mono font-black text-returni-dark tracking-widest">{details.short_code}</p>
            </div>
            <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-widest">
              {isExpired ? 'Code has expired' : `Valid until ${new Date(details.expires_at).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-400 font-bold leading-tight">
             Show this receipt or code to the merchant to redeem your backpay.
           </p>
        </div>
      </div>

      <div className="mt-8 text-center">
         <Link href="/scan" className="inline-flex items-center gap-2 bg-returni-dark text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition shadow-xl shadow-gray-400/20 uppercase tracking-widest">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
           Merchant Login
         </Link>
      </div>
    </main>
  );
}
