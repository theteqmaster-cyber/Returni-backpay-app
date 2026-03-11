'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple page that loads when the deep link /bp/TOKEN is clicked
// Customers see their code.
export default function BackpayTokenPage({ params }: { params: { token: string } }) {
  return (
    <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center justify-center pt-8 pb-16">
      <div className="bg-white px-6 py-10 rounded-[2rem] shadow-xl border border-gray-100 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-green-50 text-returni-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-returni-dark mb-3 tracking-tight">
          Your Reward
        </h1>
        <p className="text-returni-dark/70 mb-8 px-2 text-base font-medium leading-relaxed">
          Show this token or QR code to the merchant to claim your discount on your next visit!
        </p>

        <div className="bg-returni-bg px-4 py-8 rounded-3xl border-2 border-dashed border-returni-green/40 mb-8">
          <p className="text-xs font-bold text-returni-green mb-3 uppercase tracking-widest">Redemption Token</p>
          <p className="text-3xl font-mono font-black tracking-widest text-returni-dark">{params.token}</p>
        </div>

        <p className="text-xs font-medium text-gray-400">
           The merchant must be logged into RETURNi to process this claim.
        </p>
      </div>

      <div className="mt-8 text-center bg-white py-4 px-6 rounded-2xl shadow-sm border border-gray-100">
         <p className="text-sm font-bold text-returni-dark mb-2">Are you the Merchant?</p>
         <Link href={`/scan`} className="inline-block bg-returni-blue text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20">
           Open Scanner
         </Link>
      </div>
    </main>
  );
}
