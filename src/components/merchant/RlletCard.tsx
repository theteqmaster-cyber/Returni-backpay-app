'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RlletCard() {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wallet balance from our internal API which bridges to ZB Sandbox
    fetch('/api/wallet/balance')
      .then(res => res.json())
      .then(data => {
        if (data && data.amount) {
          setBalance(data.amount);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-r from-returni-dark to-slate-900 rounded-3xl p-6 shadow-xl border border-white/10 mb-8 relative overflow-hidden group">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-returni-green/5 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
      
      {/* Sandbox Badge */}
      <div className="absolute top-0 right-0 bg-returni-green/20 border-b border-l border-white/10 rounded-bl-xl px-3 py-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#2fbb5e]">experimental</span>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white font-bold tracking-tight text-xl flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#2fbb5e] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
              Rllet Wallet
            </h2>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Powered by ZB</p>
          </div>
        </div>

        <div className="my-2">
          <p className="text-white/60 text-xs font-medium mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[#2fbb5e] text-lg font-bold">USD</span>
            <span className="text-4xl font-black text-white tracking-tight">
              {loading ? '...' : balance || '0.00'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1.5" title="ZB Supported">
              <span className="text-[10px] font-black text-white/50">ZB</span>
            </div>
          </div>
          <Link
            href="/merchant/rllet"
            className="flex items-center gap-2 bg-[#2fbb5e] hover:bg-green-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-green-900/20"
          >
            Open Dashboard
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
