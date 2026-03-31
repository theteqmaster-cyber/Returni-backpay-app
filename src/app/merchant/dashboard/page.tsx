'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { InstallPWAButton } from '@/components/InstallPWAButton';
import PulseGraph from '@/components/PulseGraph';

export default function MerchantDashboardPage() {
  const router = useRouter();
  const [userFullName, setUserFullName] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    totalVol: { USD: "0.00", ZAR: "0.00", ZIG: "0.00" },
    unclaimedLiability: { USD: "0.00", ZAR: "0.00", ZIG: "0.00" },
    platformFee: "10.00",
    recentTransactions: [] as any[],
    dailySales: [] as any[]
  });
  const [error, setError] = useState<string>('');
  const [promoText, setPromoText] = useState('');
  const [promoImages, setPromoImages] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('returni_merchant_id');
    const name = localStorage.getItem('returni_user_name');
    
    if (!id) {
       router.push('/merchant/login');
       return;
    }
    
    if (name) setUserFullName(name);
    
    setLoading(true);
    setError('');
    fetch(`/api/stats?merchantId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
          if (data.merchant) {
            setPromoText(data.merchant.promo_text || '');
            if (data.merchant.promo_images && Array.isArray(data.merchant.promo_images)) {
              const imgs = [...data.merchant.promo_images];
              while (imgs.length < 3) imgs.push('');
              setPromoImages(imgs.slice(0, 3));
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to connect to server');
        setLoading(false);
      });
  }, [router]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    const merchantId = localStorage.getItem('returni_merchant_id');
    try {
      const res = await fetch('/api/merchant/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          promoText,
          promoImages: promoImages.filter(img => img.trim() !== '')
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) return;

    const localUrl = URL.createObjectURL(file);
    const updatedLocalPreviews = [...promoImages];
    updatedLocalPreviews[index] = localUrl;
    setPromoImages(updatedLocalPreviews);

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${merchantId}/${Date.now()}-${index}.${fileExt}`;
      const filePath = `${fileName}`;

      const { supabase } = await import('@/lib/supabase');
      if (!supabase) throw new Error('Supabase client error');

      const { data, error: uploadError } = await supabase.storage
        .from('promotions')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('promotions')
        .getPublicUrl(filePath);

      const newImages = [...promoImages];
      newImages[index] = publicUrl;
      setPromoImages(newImages);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Error uploading image: ' + err.message);
      const reverted = [...promoImages];
      reverted[index] = '';
      setPromoImages(reverted);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-lg mx-auto">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="text-red-700 font-bold text-sm">{error}</p>
          </div>
          <p className="text-red-600/60 text-[10px] mt-1 font-medium ml-8">Please check if the new Supabase SQL functions were applied correctly.</p>
        </div>
      )}
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
        Welcome, {userFullName || 'Merchant'}
      </h1>
      <p className="text-returni-dark/60 text-sm mb-6 font-medium">Business Overview</p>

      <InstallPWAButton />

      <div className="flex gap-4 mb-4">
        <Link
          href="/merchant/transaction"
          className="flex-1 py-4 px-6 rounded-2xl bg-returni-green text-white font-bold text-center shadow-lg shadow-green-600/30 hover:bg-returni-darkGreen transition-all transform hover:-translate-y-0.5"
        >
          New Sale
        </Link>
        <Link
          href="/merchant/analytics"
          className="flex-1 py-4 px-6 rounded-2xl border-2 border-returni-dark text-returni-dark font-bold text-center hover:bg-gray-50 transition-colors"
        >
          View Analytics
        </Link>
      </div>

      <Link
        href="/merchant/print"
        className="w-full mb-8 py-3 px-6 rounded-2xl border border-gray-300 bg-white text-returni-dark/70 font-semibold text-center flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / Export Sales Report
      </Link>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-medium mb-1">Today&apos;s Sales</p>
          <p className="text-3xl font-bold text-returni-green">{loading ? '...' : stats.todaySalesCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-1">
          <p className="text-returni-dark/60 text-sm font-medium mb-1">Total Vol</p>
          <span className="text-2xl font-bold text-returni-green">{loading ? '...' : `$${(stats.totalVol as any)?.USD ?? '0.00'}`}</span>
          <span className="text-sm font-semibold text-returni-green/80">{loading ? '...' : `ZAR ${(stats.totalVol as any)?.ZAR ?? '0.00'}`}</span>
          <span className="text-sm font-semibold text-returni-green/80">{loading ? '...' : `ZiG ${(stats.totalVol as any)?.ZIG ?? '0.00'}`}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-6 mt-4 relative overflow-hidden group/card shadow-green-900/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-returni-green/5 rounded-full -mr-12 -mt-12 group-hover/card:scale-110 transition-transform"></div>
        
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-black text-returni-dark leading-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-returni-green rounded-full animate-pulse"></span>
              Sales Progress
            </h2>
            <p className="text-returni-dark/40 text-[10px] uppercase font-black tracking-widest mt-1">Live Market Pulse</p>
          </div>
          <div className="flex items-center gap-2 text-returni-green font-black text-[10px] uppercase tracking-widest animate-pulse">
             <div className="w-2 h-2 bg-returni-green rounded-full"></div>
             Live
          </div>
        </div>

        <div className="relative mt-4 select-none">
          {loading ? (
             <div className="w-full h-40 flex items-center justify-center">
                <div className="w-full h-px bg-gray-100 animate-pulse relative">
                   <div className="absolute right-0 -top-2 w-4 h-4 bg-returni-green/20 rounded-full animate-ping"></div>
                </div>
             </div>
          ) : !stats.dailySales || stats.dailySales.length === 0 ? (
             <div className="w-full h-40 border-b-2 border-dashed border-gray-50 flex items-center justify-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest text-returni-dark italic">Patiently Waiting for Sales...</p>
             </div>
          ) : (
             <div className="relative">
                <PulseGraph data={stats.dailySales} height={160} />

                <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
                   {stats.dailySales.map((d: any, i: number) => (
                      <span key={i} className="text-[9px] font-black text-gray-400 uppercase tracking-tighter w-8 text-center">{d.day}</span>
                   ))}
                </div>

                <div className="absolute top-0 right-0 bottom-0 left-0 pointer-events-none overflow-visible">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                   {(() => {
                      const todayData = stats.dailySales[stats.dailySales.length - 1];
                      const maxCount = Math.max(...stats.dailySales.map((s: any) => s.count), 5);
                      const yVal = 100 - (todayData.count / maxCount) * 70 - 15;
                      
                      return (
                         <g transform={`translate(100, ${yVal})`} className="animate-float overflow-visible">
                            <circle r="6" className="fill-returni-green/20 animate-ping" />
                            <g transform="translate(-10, -10)">
                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 4C9.79086 4 8 5.79086 8 8V9C8 9.55228 8.44772 10 9 10H15C15.5523 10 16 9.55228 16 9V8C16 5.79086 14.2091 4 12 4Z" fill="#10B981"/>
                                  <path d="M4 12C4 10.8954 4.89543 10 6 10H18C19.1046 10 20 10.8954 20 12V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V12Z" fill="#10B981"/>
                                  <circle cx="12" cy="13" r="1.5" fill="white" className="animate-pulse" />
                               </svg>
                            </g>
                         </g>
                      );
                   })()}
                  </svg>
                </div>
             </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(100%); }
          50% { transform: translateY(-8px) translateX(100%); }
        }
        .animate-float { animation: float 1.5s ease-in-out infinite; }
      `}</style>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
        <h2 className="text-xl font-black text-returni-dark mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-returni-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl"></div>)
          ) : stats.recentTransactions && stats.recentTransactions.length > 0 ? (
            stats.recentTransactions.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-returni-green/10 flex items-center justify-center text-returni-green">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-returni-dark">${parseFloat(tx.amount || '0').toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${tx.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {tx.status || 'Success'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-returni-green/5 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-xl font-black text-returni-dark mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-returni-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167a2.405 2.405 0 00-1.712-1.541l-2.147-.617a2.33 2.33 0 01-.482-4.396l2.147-.617a2.405 2.405 0 001.712-1.541L7.583 5.29a1.76 1.76 0 013.417.592zm3.677 2.197a4.1 4.1 0 010 5.842M19.828 4.486a9.14 9.14 0 010 12.918"></path></svg>
          Promotions & Control
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Display Message to Customers</label>
            <textarea
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="e.g. Get 20% off your next coffee when you show this receipt!"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-returni-green outline-none transition-all font-medium text-sm h-24 resize-none bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Featured Photos (Max 3)</label>
            <div className="grid grid-cols-3 gap-3">
              {promoImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <label className="cursor-pointer block w-full h-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, idx)}
                      className="hidden"
                    />
                    <div className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-gray-50/50 ${img ? 'border-returni-green' : 'border-gray-200 hover:border-returni-green hover:bg-green-50/30'}`}>
                      {img ? (
                        <div className="relative w-full h-full">
                          <Image src={img} fill className="object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                             <span className="text-[10px] text-white font-black uppercase tracking-widest">Change</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Upload</span>
                        </>
                      )}
                    </div>
                  </label>
                  {img && (
                    <button 
                      onClick={() => {
                        const newImgs = [...promoImages];
                        newImgs[idx] = '';
                        setPromoImages(newImgs);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full shadow-lg flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${saveSuccess ? 'bg-returni-green text-white scale-[1.02]' : 'bg-returni-dark text-white hover:bg-black'}`}
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Settings Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-returni-blue"></div>
        <h2 className="font-semibold text-returni-dark mb-1 pl-2">RETURNi Platform Fee</h2>
         <p className="text-returni-dark/60 text-xs mb-3 pl-2">Monthly operating cost.</p>
        <p className="text-4xl font-black text-returni-dark pl-2">
          ${loading ? '...' : stats.platformFee}
        </p>
        <div className="text-returni-dark/60 text-sm mt-4 border-t pt-4 flex justify-between items-center pl-2">
           <span className="font-medium">Status: <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md ml-1">Unpaid</span></span>
           <span className="text-returni-blue font-bold hover:text-blue-700 cursor-pointer transition-colors">View Receipt &rarr;</span>
        </div>
      </div>

      {(stats as any).agentContact && (
         <div className="bg-blue-50/50 rounded-2xl p-5 shadow-sm border border-blue-100 mb-8 flex items-start gap-4">
            <div className="bg-returni-blue text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
               {(stats as any).agentContact.full_name?.[0] || 'A'}
            </div>
            <div>
               <h2 className="font-bold text-returni-dark text-lg mb-1 tracking-tight">Your Agent</h2>
               <p className="text-returni-dark/70 text-sm mb-3 font-medium">
                 {(stats as any).agentContact.full_name} is here to assist you with any physical needs.
               </p>
               <div className="flex gap-3">
                  {(stats as any).agentContact.phone && (
                     <a href={`tel:${(stats as any).agentContact.phone}`} className="text-xs font-bold bg-white text-returni-dark border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        Call Agent
                     </a>
                  )}
                  {(stats as any).agentContact.email && (
                     <a href={`mailto:${(stats as any).agentContact.email}`} className="text-xs font-bold bg-returni-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        Email Agent
                     </a>
                  )}
               </div>
            </div>
         </div>
      )}
      <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
        <Link 
          href="/support" 
          className="w-full py-4 rounded-2xl bg-white border border-gray-100 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-returni-green hover:border-returni-green/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"
        >
          <span>Need Help? Report Issue</span>
          <span className="w-1.5 h-1.5 bg-returni-green rounded-full animate-pulse"></span>
        </Link>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] mb-12">
          &copy; {new Date().getFullYear()} RETURNi SYSTEM
        </p>
      </div>
    </main>
  );
}
