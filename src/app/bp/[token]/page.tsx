'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  const [activeTab, setActiveTab] = useState<'reward' | 'promos'>('reward');

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
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#2fbb5e] rounded-full animate-spin mb-6 shadow-lg shadow-green-900/5"></div>
        <div className="text-gray-400 font-bold text-sm tracking-widest uppercase animate-pulse">Retrieving Data...</div>
      </main>
    );
  }

  if (error || !details) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-red-900/5 border border-red-50 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-returni-dark font-black text-lg mb-2">Invalid Link</p>
          <p className="text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100">{error || 'This receipt could not be found.'}</p>
          <Link href="/" className="text-white bg-returni-dark hover:bg-black px-6 py-3 rounded-xl font-bold transition-colors inline-block w-full">Return Home</Link>
        </div>
      </main>
    );
  }

  const sym = getCurrencySymbol(details.currency);
  const isExpired = details.expires_at && new Date(details.expires_at) < new Date();
  const isClaimed = details.status === 'claimed';
  const hasPromo = !!details.promo_text || (details.promo_images && details.promo_images.length > 0);
  const promoImages = details.promo_images && details.promo_images.length > 0 ? details.promo_images : [];

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-x-hidden flex justify-center selection:bg-[#2fbb5e] selection:text-white pb-20 lg:pb-0 font-sans">
      
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2fbb5e]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Main App Container */}
      <div className={`w-full ${hasPromo ? 'max-w-md lg:max-w-5xl' : 'max-w-md'} mx-auto relative z-10 flex flex-col h-full lg:h-auto lg:my-10 lg:rounded-[2.5rem] lg:shadow-2xl lg:shadow-black/5 bg-[#F8FAFC] lg:overflow-hidden ring-1 ring-black/5`}>
        
        {/* Header Overlay */}
        <header className="bg-white px-6 pt-10 pb-6 lg:pb-8 lg:px-10 rounded-b-[2rem] lg:rounded-none shadow-sm relative z-20 border-b lg:border-gray-100/50">
           <div className="flex items-center justify-between mb-4">
              <Image src="/logo.jpg" alt="Returni" width={32} height={32} className="rounded-lg ring-1 ring-gray-100 shadow-sm" />
              <div className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md bg-green-50 text-[#2fbb5e] shadow-sm">Verified Transaction</div>
           </div>
           <h2 className="text-gray-400 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] mb-1.5">Official Receipt & Reward</h2>
           <h1 className="text-3xl lg:text-4xl font-black text-returni-dark tracking-tight leading-none truncate">{details.merchant_name}</h1>
           
           {/* Mobile Segmented Control / Tabs (Hidden on Desktop) */}
           {hasPromo && (
             <div className="flex lg:hidden bg-gray-100 p-1.5 rounded-xl mt-6 shadow-inner">
                <button 
                  onClick={() => setActiveTab('reward')}
                  className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'reward' ? 'bg-white shadow-sm text-returni-dark' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  My Reward
                </button>
                <button 
                  onClick={() => setActiveTab('promos')}
                  className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'promos' ? 'bg-white shadow-sm text-[#2fbb5e]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Store Offers
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2fbb5e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2fbb5e]"></span>
                  </span>
                </button>
             </div>
           )}
        </header>

        {/* Dynamic Content Area (Split on Desktop, Tabs on Mobile) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative lg:flex lg:flex-row lg:items-stretch lg:overflow-visible">
          
          {/* TAB 1: Reward & Receipt */}
          <div className={`p-6 transition-all duration-500 w-full lg:w-[480px] lg:shrink-0 lg:p-10 ${!hasPromo && 'lg:w-full lg:max-w-md lg:mx-auto'} ${activeTab === 'reward' ? 'relative translate-x-0 opacity-100' : 'absolute -translate-x-full opacity-0 lg:relative lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto pointer-events-none'}`}>
             
             {/* Reward Card */}
             <div className="bg-gradient-to-br from-[#1A1A2E] to-[#152e1f] rounded-[2rem] p-8 shadow-2xl mb-6 relative overflow-hidden group border border-[#2fbb5e]/10">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#2fbb5e]/20 blur-[40px] -translate-y-1/2 translate-x-1/2 rounded-full mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-6 right-6 text-white/5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                   <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>

                <div className="relative z-10">
                   <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-1">Available Backpay</p>
                   <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-[#2fbb5e] font-black text-3xl">{sym}</span>
                      <span className="text-white font-black text-6xl tracking-tighter">{details.backpay_amount}</span>
                   </div>

                   <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center shadow-inner">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5">Redemption Code</p>
                      <p className="text-4xl font-mono font-black text-white tracking-[0.3em]">{details.short_code}</p>
                   </div>
                   
                   <div className="mt-6 flex justify-between items-center px-1">
                      <div className={`text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm ${isClaimed ? 'bg-[#2fbb5e]/20 text-[#2fbb5e] ring-1 ring-[#2fbb5e]/30' : isExpired ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-white/10 text-white ring-1 ring-white/20'}`}>
                        {isClaimed ? 'CLAIMED' : isExpired ? 'EXPIRED' : 'ACTIVE / READY'}
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                         Valid {details.expires_at ? `to ${new Date(details.expires_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}` : 'Forever'}
                      </p>
                   </div>
                </div>
             </div>

             {/* Receipt History Mini-Card */}
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Receipt Total</p>
                   <div className="flex items-center gap-2.5">
                      <p className="text-returni-dark font-black text-xl">{sym}{details.amount}</p>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                      <p className="text-gray-500 text-xs font-bold">{new Date(details.date).toLocaleDateString()}</p>
                   </div>
                   {details.notes && <p className="text-gray-400 text-[11px] font-medium italic mt-1.5 truncate max-w-[200px] lg:max-w-full">&quot;{details.notes}&quot;</p>}
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 border border-gray-100 shadow-inner">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
             </div>
          </div>

          {/* TAB 2: Promotions View (Right Side on Desktop) */}
          {hasPromo && (
             <div className={`p-6 bg-white/50 lg:bg-white lg:border-l lg:border-gray-100 transition-all duration-500 w-full lg:flex-1 lg:p-10 ${activeTab === 'promos' ? 'relative translate-x-0 opacity-100' : 'absolute translate-x-full opacity-0 lg:relative lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto pointer-events-none'}`}>
               
               <div className="hidden lg:block mb-6">
                  <h3 className="text-returni-dark text-lg font-black tracking-tight flex items-center gap-2">
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2fbb5e] opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2fbb5e]"></span>
                     </span>
                     Store Promos & Offers
                  </h3>
               </div>

               {details.promo_text && (
                  <div className="mb-8 lg:mb-10 bg-[#2fbb5e] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-green-900/10">
                     <svg className="absolute top-0 right-0 w-40 h-40 opacity-10 -mr-6 -mt-6 text-black pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                     <p className="relative z-10 text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                       {details.promo_text}
                     </p>
                  </div>
               )}

               <div className="space-y-6 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-6">
                  {promoImages.map((img, idx) => (
                     <div key={idx} className="w-full bg-white p-2.5 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
                        <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-gray-50">
                           <Image 
                              src={img} 
                              alt={`Promotion ${idx+1}`} 
                              fill 
                              className="object-cover hover:scale-105 transition-transform duration-700"
                           />
                        </div>
                     </div>
                  ))}
               </div>
               
               <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-10 pb-4 flex items-center justify-center gap-2 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200">
                  End of Offers
               </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
