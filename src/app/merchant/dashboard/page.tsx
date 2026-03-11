'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MerchantDashboardPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState<string>('');
  
  // Later we'll hook this up to the /api/stats route with real data
  // For MVP we can just use static placeholders, or fetch real data
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors">
          &larr; Home
        </Link>
        <button
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => {
              localStorage.removeItem('returni_merchant_id');
              router.push('/merchant/login');
             });
          }}
          className="text-returni-dark/60 text-sm hover:text-red-500 transition-colors font-medium bg-gray-100 px-4 py-2 rounded-lg"
        >
          Log out
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-returni-dark mb-1 tracking-tight">
        Dashboard
      </h1>
      <p className="text-returni-dark/60 text-sm mb-8 font-medium">Business Overview</p>

      <div className="flex gap-4 mb-8">
        <Link
          href="/merchant/transaction"
          className="flex-1 py-4 px-6 rounded-2xl bg-returni-green text-white font-bold text-center shadow-lg shadow-green-600/30 hover:bg-returni-darkGreen transition-all transform hover:-translate-y-0.5"
        >
          New Sale
        </Link>
        <Link
          href="/scan"
          className="flex-1 py-4 px-6 rounded-2xl border-2 border-returni-dark text-returni-dark font-bold text-center hover:bg-gray-50 transition-colors"
        >
          Redeem QR
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-medium mb-1">Today&apos;s Sales</p>
          <p className="text-3xl font-bold text-returni-green">0</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-medium mb-1">Total Vol</p>
          <p className="text-3xl font-bold text-returni-green">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mb-6 mt-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-400"></div>
        <h2 className="font-semibold text-returni-dark mb-1 pl-2">Unclaimed Liability</h2>
        <p className="text-returni-dark/60 text-xs mb-3 pl-2">Total backpay owed to returning clients.</p>
        <p className="text-4xl font-black text-returni-dark pl-2">
          $0.00
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-returni-blue"></div>
        <h2 className="font-semibold text-returni-dark mb-1 pl-2">RETURNi Platform Fee</h2>
         <p className="text-returni-dark/60 text-xs mb-3 pl-2">Monthly operating cost.</p>
        <p className="text-4xl font-black text-returni-dark pl-2">
          $5.00
        </p>
        <div className="text-returni-dark/60 text-sm mt-4 border-t pt-4 flex justify-between items-center pl-2">
           <span className="font-medium">Status: <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md ml-1">Unpaid</span></span>
           <span className="text-returni-blue font-bold hover:text-blue-700 cursor-pointer transition-colors">View Receipt &rarr;</span>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-returni-dark mb-4 text-lg">Recent Transactions</h2>
        <div className="flex flex-col items-center justify-center py-8 opacity-50">
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p className="text-returni-dark text-sm font-medium">No transactions yet.</p>
        </div>
      </div>
    </main>
  );
}
