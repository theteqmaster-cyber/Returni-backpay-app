'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgentDashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">
          Agent Dashboard
        </h1>
        <button
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => {
               router.push('/agent/login')
            })
          }}
          className="text-returni-dark/60 text-sm font-bold bg-white px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Log out
        </button>
      </div>

      <p className="text-returni-dark/60 text-sm font-bold uppercase tracking-widest mb-6">Your Performance</p>

      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 mb-8 border-l-8 border-l-returni-green flex flex-col justify-center">
         <p className="text-returni-dark/60 text-sm font-bold uppercase tracking-wider mb-2">Expected Payout</p>
         <p className="text-5xl font-black text-returni-dark">$0.00</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-bold mb-2">Active Merchants</p>
          <p className="text-3xl font-black text-returni-green">...</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-bold mb-2">Pending Fees</p>
          <p className="text-3xl font-black text-returni-green">...</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="font-bold text-returni-dark mb-4 text-xl">My Merchants</h2>
        <div className="flex flex-col items-center justify-center py-8 opacity-50">
           <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
           <p className="text-sm font-medium text-returni-dark">No merchants recruited yet.</p>
        </div>
      </div>
    </main>
  );
}
