'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Redesigned Receipt Page: Prioritizes Merchant Promotions
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
    promo_text?: string;
    promo_images?: string[];
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-returni-green mb-4"></div>
        <div className="text-returni-green font-bold text-xl animate-pulse">Loading your rewards...</div>
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
  const hasImages = details.promo_images && details.promo_images.length > 0;
  const promoImages = hasImages ? details.promo_images : ['/logo.jpg'];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Section: Promotion + Merchant Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto">
          {/* Brand Header */}
          <div className="pt-8 pb-4 px-6 text-center">
             <h2 className="text-returni-green text-[10px] font-black uppercase tracking-[0.3em] mb-1">Your Store</h2>
             <h1 className="text-2xl font-black text-returni-dark tracking-tight uppercase leading-tight">{details.merchant_name}</h1>
          </div>

          {/* Interesting Bolder Promotion Message - NOW ABOVE PHOTOS */}
          {details.promo_text && (
            <div className="px-8 pt-4 pb-8 text-center">
              <div className="relative inline-block">
                <span className="absolute -top-6 -left-6 text-7xl text-returni-green/10 font-serif">“</span>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-returni-dark via-returni-green to-returni-dark leading-tight tracking-tighter italic px-4 relative z-10">
                  {details.promo_text}
                </p>
                <span className="absolute -bottom-10 -right-6 text-7xl text-returni-green/10 font-serif">”</span>
              </div>
            </div>
          )}

          {/* Promotion Gallery - Vertical List for 'Marketing Strategy' */}
          <div className="flex flex-col gap-4 px-6 pb-8">
             {promoImages!.map((img, idx) => (
                <div key={idx} className="w-full aspect-[16/10] rounded-[2rem] overflow-hidden bg-gray-50 shadow-lg border border-gray-100">
                   <Image 
                      src={img} 
                      alt={`Promo ${idx + 1}`} 
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                   />
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 relative z-20">
        {/* Backpay & Code Card - The main action container */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5 text-center border border-gray-100 mb-6">
           <div className="w-16 h-16 bg-green-50 text-returni-green rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           
           <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Backpay Reward</p>
           <div className="flex justify-center items-baseline gap-1 mb-8">
              <span className="text-returni-green font-black text-3xl">{sym}</span>
              <span className="text-6xl font-black tracking-tighter text-returni-dark">{details.backpay_amount}</span>
           </div>

           <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Redemption Code</p>
              <p className="text-5xl font-mono font-black tracking-[0.2em] text-returni-dark">{details.short_code}</p>
           </div>

           <div className={`text-[10px] font-bold uppercase px-4 py-2 rounded-xl inline-block ${isClaimed ? 'bg-green-50 text-green-600' : isExpired ? 'bg-red-50 text-red-600' : 'bg-returni-green/10 text-returni-green border border-returni-green/20'}`}>
             {isClaimed ? '✓ Claimed' : isExpired ? '× Expired' : 'Ready to use at store'}
           </div>
        </div>

        {/* Mini Receipt Summary */}
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Receipt Summary</p>
              <div className="flex items-center gap-2">
                 <p className="text-sm font-black text-returni-dark">{sym}{details.amount}</p>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <p className="text-[11px] font-bold text-gray-500">{new Date(details.date).toLocaleDateString()}</p>
              </div>
              {details.notes && <p className="text-[10px] text-gray-400 font-medium italic mt-1 truncate max-w-[150px]">&quot;{details.notes}&quot;</p>}
           </div>
           <Image src="/logo.jpg" alt="Returni" width={32} height={32} className="rounded-lg opacity-30 grayscale" />
        </div>
      </div>
    </main>
  );
}
