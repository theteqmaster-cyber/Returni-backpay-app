'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoMerchantDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [updatingKyc, setUpdatingKyc] = useState(false);
  const [balances, setBalances] = useState({ USD: 0, ZiG: 0 });
  const [totalSales, setTotalSales] = useState('0.00');
  const [inventoryCount, setInventoryCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [brickboard, setBrickboard] = useState({
      promo_text: '',
      image_url_1: '',
      image_url_2: '',
      image_url_3: '',
      is_published: true
  });
  const [savingBrickboard, setSavingBrickboard] = useState(false);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Basic Size Check (< 2MB for demo)
    if (file.size > 2 * 1024 * 1024) {
        alert('File is too large! Please keep it under 2MB for the demo.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        setBrickboard(prev => ({ ...prev, [`image_url_${slot}`]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleIDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
        setIdPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const completeKYC = () => {
    if (!idPhoto) {
        alert('Please upload a photo of your ID to proceed with verification.');
        return;
    }
    localStorage.setItem('demo_merchant_kyc', 'true');
    setKycCompleted(true);
    setShowKycModal(false);
    alert('KYC Documents submitted for verification!');
  };

  useEffect(() => {
    const merchantId = localStorage.getItem('demo_merchant_id');
    const name = localStorage.getItem('demo_merchant_name');
    const isKycDone = localStorage.getItem('demo_merchant_kyc') === 'true';
    
    if (isKycDone) setKycCompleted(true);
    
    if (!merchantId) {
      router.push('/demo-merchant/login');
      return;
    }

    setLoading(true);
    
    // Initial user setup
    setUser({
      id: merchantId,
      businessName: name || 'Demo Merchant',
    });
    
    const fetchData = async () => {
      try {
        // Parallel data fetch
        const [walletRes, analyticsRes, inventoryRes] = await Promise.all([
          fetch(`/api/demo/wallet?merchantId=${merchantId}`),
          fetch(`/api/demo/vest-ai?merchantId=${merchantId}`),
          fetch(`/api/demo/inventory?demoMerchantId=${merchantId}`)
        ]);
        
        const walletData = await walletRes.json();
        const analyticsData = await analyticsRes.json();
        const inventoryData = await inventoryRes.json();
        
        // Diagnostic Logging - check your browser console!
        console.log('--- DB DIAGNOSTICS ---');
        console.log('Wallet Data:', walletData);
        if (walletData.transactions) console.table(walletData.transactions);
        if (inventoryData.items) console.table(inventoryData.items);

        if (walletData.balances) setBalances(walletData.balances);
        if (analyticsData) setAnalytics(analyticsData);
        
        if (inventoryData.success) {
            // Use 0 as fallback if stock_level column is null/zero
            const units = inventoryData.items.reduce((sum: number, item: any) => sum + Number(item.stock_level || 0), 0);
            const lowCount = inventoryData.items.filter((item: any) => Number(item.stock_level || 0) < 5).length;
            setInventoryCount(units);
            setLowStockCount(lowCount);
        }

        // Calculate Total Sales: Filter for 'receive'. 
        // We use category: 'Client' OR if category is missing, we just take all 'receive' records
        if (walletData.transactions) {
            const sales = walletData.transactions
                .filter((tx: any) => tx.type === 'receive' && (tx.category === 'Client' || !tx.category))
                .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);
            setTotalSales(sales.toFixed(2));
        }

        // Fetch Brickboard
        const brickRes = await fetch(`/api/demo/brickboard?merchantId=${merchantId}`);
        const brickData = await brickRes.json();
        if (brickData.success && brickData.brickboard) {
            setBrickboard({
                promo_text: brickData.brickboard.promo_text || '',
                image_url_1: brickData.brickboard.image_url_1 || '',
                image_url_2: brickData.brickboard.image_url_2 || '',
                image_url_3: brickData.brickboard.image_url_3 || '',
                is_published: brickData.brickboard.is_published ?? true
            });
        }

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCompleteKyc = () => {
    if (!idPhoto) {
      alert('Please take/upload a photo of your ID to complete verification.');
      return;
    }
    
    setUpdatingKyc(true);
    // Simulated API call with real persistence
    setTimeout(() => {
        localStorage.setItem('demo_merchant_kyc', 'true');
        setKycCompleted(true);
        setShowKycModal(false);
        setUpdatingKyc(false);
        alert('KYC Verified! Your node is now fully authorized.');
    }, 1500);
  };

  const handleUpdateBrickboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBrickboard(true);
    try {
        const res = await fetch('/api/demo/brickboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchantId: user.id,
                promoText: brickboard.promo_text,
                imageUrl1: brickboard.image_url_1,
                imageUrl2: brickboard.image_url_2,
                imageUrl3: brickboard.image_url_3,
                isPublished: brickboard.is_published
            })
        });
        if (res.ok) {
            alert('Brickboard Updated! Your promotion is now live on the discovery feed.');
        }
    } catch (err) {
        console.error('Update error:', err);
    } finally {
        setSavingBrickboard(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 font-sans pb-20 relative overflow-hidden">
      {/* Deep Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] -ml-64 -mb-64 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">{user?.businessName}</h1>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">Live Protocol V3</p>
            </div>
            
            {/* Wallet Balance Pill */}
            <Link 
              href="/demo-merchant/wallet"
              className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-4 group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 group-hover:text-slate-300 transition-colors">USD Balance</span>
                <span className="text-sm font-black text-white leading-none">${balances.USD}</span>
              </div>
              <div className="w-px h-6 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 group-hover:text-slate-300 transition-colors">ZiG Balance</span>
                <span className="text-sm font-black text-white leading-none">{balances.ZiG} ZiG</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                  localStorage.removeItem('demo_merchant_id');
                  localStorage.removeItem('demo_merchant_name');
                  router.push('/demo-merchant/login');
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
              >
                Log Out
              </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Sales', value: `$${totalSales}`, sub: 'Session Volume', color: 'text-white' },
              { label: 'Credit Score', value: analytics?.score || '---', sub: analytics?.level || 'Score pending', color: 'text-blue-400', isScore: true },
              { label: 'Active Units', value: inventoryCount.toString(), sub: 'In Stock', link: '/demo-merchant/inventory', color: 'text-white' },
              { label: 'Stock Alerts', value: lowStockCount.toString(), sub: 'Units Flowing Low', link: '/demo-merchant/inventory', color: Number(lowStockCount) > 0 ? 'text-red-400' : 'text-white' }
            ].map((s, i) => (
              <div 
                key={i} 
                onClick={() => s.link && router.push(s.link)}
                className={`bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all hover:bg-slate-900/60 hover:-translate-y-1 ${s.link ? 'cursor-pointer' : ''}`}
              >
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{s.label}</p>
                <p className={`text-4xl font-black mb-1 italic tracking-tighter ${s.color}`}>{s.value}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${s.isScore ? 'text-blue-500 animate-pulse' : 'text-slate-500'}`}>{s.sub}</p>
              </div>
            ))}
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {/* Terminal POS Entry */}
            <Link 
                href="/demo-merchant/terminal"
                className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-xl relative overflow-hidden group hover:bg-slate-900/60 transition-all flex flex-col justify-between"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-950 italic text-xl shadow-lg shadow-white/5 uppercase">POS</div>
                        <div className="px-3 py-1 bg-green-600/20 rounded-full text-[8px] font-black uppercase text-green-400 tracking-widest border border-green-600/30">Ready</div>
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight mb-2 uppercase">The Terminal</h3>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-[200px]">
                        Launch the Quick-Sell POS interface to process client transactions and auto-sync inventory.
                    </p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Process Customer Sale &rarr;</span>
                </div>
            </Link>

            {/* Vest AI Entry */}
            <Link 
                href="/demo-merchant/vest-ai"
                className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-xl relative overflow-hidden group hover:bg-slate-900/60 transition-all flex flex-col justify-between"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white italic text-xl shadow-lg shadow-blue-600/20">V</div>
                        <div className="px-3 py-1 bg-blue-600/20 rounded-full text-[8px] font-black uppercase text-blue-400 tracking-widest border border-blue-600/30">AI Active</div>
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight mb-2 uppercase">Vest AI Advisor</h3>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-[200px]">
                        Deep dive into your treasury analytics and credit eligibility with your personal AI advisor.
                    </p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Talk to Vest AI &rarr;</span>
                </div>
            </Link>
        </div>

        {/* BRICKBOARD SECTION */}
        <section className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none"></div>
             
             <div className="flex flex-col lg:flex-row gap-10">
                {/* EDITOR SIDE */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2">Brickboard</h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-loose">
                            Design your live discovery board for customers. updates sync instantly to the landing page.
                        </p>
                    </div>

                    <form onSubmit={handleUpdateBrickboard} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Promotion Message</label>
                            <textarea 
                                value={brickboard.promo_text}
                                onChange={(e) => setBrickboard({...brickboard, promo_text: e.target.value})}
                                placeholder="e.g. FLASH SALE: 50% OFF FOR THE NEXT 2 HOURS!"
                                className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-[2rem] text-white font-medium focus:border-blue-500 transition-all outline-none h-32 resize-none shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Discovery Visuals (3 Slots)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map((slot) => (
                                    <div key={slot} className="relative group aspect-[4/5]">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            id={`upload-${slot}`}
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, slot)}
                                        />
                                        <label 
                                            htmlFor={`upload-${slot}`}
                                            className={`w-full h-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${brickboard[`image_url_${slot}` as keyof typeof brickboard] ? 'border-blue-500/50 bg-slate-900' : 'border-white/10 hover:border-blue-500/30 bg-white/5'}`}
                                        >
                                            {brickboard[`image_url_${slot}` as keyof typeof brickboard] ? (
                                                <div className="relative w-full h-full group">
                                                    <img src={brickboard[`image_url_${slot}` as keyof typeof brickboard] as string} className="w-full h-full object-cover" alt="upload" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="bg-white text-slate-950 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest leading-none">Change Photo</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:scale-110 transition-transform tracking-tight font-black">+</div>
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Post Slot {slot}</span>
                                                </div>
                                            )}
                                        </label>
                                        {brickboard[`image_url_${slot}` as keyof typeof brickboard] && (
                                            <button 
                                                type="button"
                                                onClick={() => setBrickboard({...brickboard, [`image_url_${slot}`]: ''})}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all text-xs font-bold"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button 
                                type="submit"
                                disabled={savingBrickboard}
                                className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50"
                            >
                                {savingBrickboard ? 'Syncing...' : 'Publish to Feed'}
                            </button>
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-[1.5rem] border border-white/5">
                                <div className={`w-2 h-2 rounded-full ${brickboard.is_published ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Discovery Status: {brickboard.is_published ? 'Live' : 'Hidden'}</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* VISIONS PREVIEW SIDE */}
                <div className="lg:w-[300px] space-y-4">
                     <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-2 px-2">Discovery Preview</p>
                     
                     <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden group transition-transform hover:scale-[1.02] duration-500 border border-slate-100 flex flex-col max-w-[280px] mx-auto text-slate-950">
                        {/* Collage Header (Stitched Look) */}
                        <div className="relative aspect-square bg-slate-50 flex overflow-hidden p-2 gap-1.5">
                            {/* Main Large Slot */}
                            <div className="flex-[1.5] rounded-[1.2rem] overflow-hidden bg-slate-100 border border-slate-200">
                                {brickboard.image_url_1 ? (
                                    <img src={brickboard.image_url_1} className="w-full h-full object-cover" alt="promo" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                )}
                            </div>
                            {/* Side Slots Stack */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex-1 rounded-[1.1rem] overflow-hidden bg-slate-100 border border-slate-200">
                                    {brickboard.image_url_2 ? (
                                        <img src={brickboard.image_url_2} className="w-full h-full object-cover" alt="promo" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>
                                    )}
                                </div>
                                <div className="flex-1 rounded-[1.1rem] overflow-hidden bg-slate-100 border border-slate-200">
                                    {brickboard.image_url_3 ? (
                                        <img src={brickboard.image_url_3} className="w-full h-full object-cover" alt="promo" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>
                                    )}
                                </div>
                            </div>
                            {/* Floating Heart & Action */}
                            <div className="absolute top-4 right-4">
                                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-[0.8rem] flex items-center justify-center text-red-500 shadow-xl border border-slate-100 animate-pulse">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="px-6 pb-6 pt-3 space-y-3">
                            <div>
                                <h4 className="text-base font-black italic tracking-tighter leading-none">{user?.businessName}</h4>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 scale-90 origin-left">Verified Merchant</p>
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-tight border-l-4 border-blue-500 pl-4 py-1 italic">
                                "{brickboard.promo_text || 'Active promotion text...'}"
                            </p>
                            <div className="flex gap-2 pt-1">
                                <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Redeem Offer</div>
                            </div>
                        </div>
                     </div>
                </div>
             </div>
        </section>
      </div>

      {/* Floating Action Button (FAB) for Vest AI */}
      <Link 
        href="/demo-merchant/vest-ai"
        className="fixed bottom-10 right-10 z-50 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center font-black italic text-2xl hover:bg-blue-700 transition-all active:scale-90 group group"
      >
          <span className="relative z-10 group-hover:scale-110 transition-transform">V</span>
          <div className="absolute inset-0 bg-blue-600 rounded-2xl animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
          {/* Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl">
              Talk to Vest AI
          </div>
      </Link>

      {/* Floating Action Button (FAB) for Vest AI */}
      <Link 
        href="/demo-merchant/vest-ai"
        className="fixed bottom-10 right-10 z-50 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center font-black italic text-2xl hover:bg-blue-700 transition-all active:scale-90 group group"
      >
          <span className="relative z-10 group-hover:scale-110 transition-transform">V</span>
          <div className="absolute inset-0 bg-blue-600 rounded-2xl animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
          {/* Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl">
              Talk to Vest AI
          </div>
      </Link>

      {/* Floating KYC Reminder */}
      {!kycCompleted && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce-soft">
            <button 
                onClick={() => setShowKycModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/40 hover:bg-blue-700 transition-all flex items-center gap-3 whitespace-nowrap active:scale-95"
            >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Complete KYC to Unlock Features
            </button>
        </div>
      )}

      {/* KYC Modal Mockup */}
      {showKycModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowKycModal(false)}></div>
            <div className="bg-white p-10 md:p-12 rounded-[3.5rem] w-full max-w-lg relative z-10 shadow-2xl border border-slate-100 animate-slide-up overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tighter leading-none">Proof of Identity</h3>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-8">Scan your government issued ID to authorize settlements.</p>
                
                <div className="space-y-6 mb-10">
                    <div className="relative group aspect-[16/9]">
                        <input 
                            type="file" 
                            accept="image/*"
                            id="kyc-upload-final"
                            className="hidden"
                            onChange={handleIDUpload}
                        />
                        <label 
                            htmlFor="kyc-upload-final"
                            className={`w-full h-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${idPhoto ? 'border-blue-500/50 bg-slate-50' : 'border-slate-200 hover:border-blue-500/30 bg-white'}`}
                        >
                            {idPhoto ? (
                                <div className="relative w-full h-full group">
                                    <img src={idPhoto} className="w-full h-full object-cover" alt="ID upload" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="bg-white text-slate-950 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest leading-none">Retake Photo</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Scan ID Document</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowKycModal(false)}
                        className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                    >
                        Later
                    </button>
                    <button 
                        onClick={handleCompleteKyc}
                        disabled={updatingKyc}
                        className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50"
                    >
                        {updatingKyc ? 'Verifying...' : 'Submit ID Photo'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-soft {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -10px); }
        }
        .animate-bounce-soft { animation: bounce-soft 3s ease-in-out infinite; }
        
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </main>
  );
}
