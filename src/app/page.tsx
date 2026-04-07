'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [brickboards, setBrickboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('favorite_merchants');
    if (saved) setFavoriteIds(JSON.parse(saved));

    fetchBrickboards();
  }, []);

  const fetchBrickboards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/brickboard');
      const data = await res.json();
      if (data.success) {
        setBrickboards(data.brickboards || []);
      }
    } catch (err) {
      console.error('Error fetching brickboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavs = favoriteIds.includes(id) 
      ? favoriteIds.filter(pid => pid !== id)
      : [...favoriteIds, id];
    
    setFavoriteIds(newFavs);
    localStorage.setItem('favorite_merchants', JSON.stringify(newFavs));
  };

  // Filter and Sort: Favorites first, then by search
  const filteredBoards = brickboards
    .filter(b => {
      if (!searchQuery) return true;
      const busName = b.demo_merchants?.business_name?.toLowerCase() || '';
      const promo = b.promo_text?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return busName.includes(query) || promo.includes(query);
    })
    .sort((a, b) => {
      const aFav = favoriteIds.includes(a.merchant_id) ? 1 : 0;
      const bFav = favoriteIds.includes(b.merchant_id) ? 1 : 0;
      return bFav - aFav;
    });

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Decorative Orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Top Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic text-white shadow-lg shadow-blue-600/20">R</div>
            <span className="font-black tracking-tighter text-xl italic uppercase">Returni <span className="text-blue-500">Discovery</span></span>
        </div>
        <div className="flex gap-4">
            <Link href="/demo-merchant/login" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                Merchant Portal
            </Link>
            <Link href="/merchant/login" className="hidden md:block px-5 py-2.5 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-white/5">
                Standard Login
            </Link>
        </div>
      </nav>

      {/* Hero / Search Hub */}
      <header className="py-20 px-6 max-w-4xl mx-auto text-center space-y-8">
          <div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Brickboard</span>
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Live promotional cards from your local nodes</p>
          </div>

          <div className="relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchants or specific offers..."
                className="w-full bg-slate-900/50 border border-white/10 px-8 py-6 rounded-[2.5rem] text-lg font-medium outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-2xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-600/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
          </div>
      </header>

      {/* Discovery Feed */}
      <section className="max-w-7xl mx-auto px-6 pb-40">
          {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
          ) : filteredBoards.length === 0 ? (
              <div className="text-center py-40 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
                  <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No discovery cards found in this sector</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredBoards.map((board) => (
                      <div 
                        key={board.merchant_id}
                        className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 border border-slate-100 flex flex-col mx-auto text-slate-950 relative w-full ${favoriteIds.includes(board.merchant_id) ? 'ring-4 ring-blue-500/20 shadow-blue-500/10' : ''} ${!board.id ? 'grayscale opacity-70 bg-slate-50' : ''}`}
                      >
                         {/* Collage Header (Stitched Look) */}
                         <div className="relative aspect-square bg-slate-50 flex overflow-hidden p-2 gap-1.5">
                            {/* Main Large Slot */}
                            <div className="flex-[1.5] rounded-[1.2rem] overflow-hidden bg-slate-100 border border-slate-200">
                                {board.image_url_1 ? (
                                    <img src={board.image_url_1} className="w-full h-full object-cover" alt="promo" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                )}
                            </div>
                            {/* Side Slots Stack */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                <div className="flex-1 rounded-[1rem] overflow-hidden bg-slate-100 border border-slate-200">
                                    {board.image_url_2 ? (
                                        <img src={board.image_url_2} className="w-full h-full object-cover" alt="promo" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>
                                    )}
                                </div>
                                <div className="flex-1 rounded-[1rem] overflow-hidden bg-slate-100 border border-slate-200">
                                    {board.image_url_3 ? (
                                        <img src={board.image_url_3} className="w-full h-full object-cover" alt="promo" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Favorite Heart Button */}
                            <button 
                                onClick={() => toggleFavorite(board.merchant_id)}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md active:scale-95 ${favoriteIds.includes(board.merchant_id) ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-300 hover:text-red-400'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                            </button>
                         </div>

                         {/* Content Body */}
                         <div className="px-6 pb-8 pt-3 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xl font-black italic tracking-tighter leading-none text-slate-950 uppercase line-clamp-1">{board.demo_merchants?.business_name}</h4>
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">
                                        {!board.id ? 'Not Live' : 'Verified Node'}
                                    </p>
                                </div>
                                <div className="text-[8px] font-bold text-slate-400 italic uppercase">
                                    {board.updated_at ? new Date(board.updated_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            
                            <div className={`p-4 rounded-[1.5rem] border transition-colors ${!board.id ? 'bg-slate-100/50 border-slate-200 border-dashed' : 'bg-slate-50 border-slate-100 group-hover:border-blue-500/20'}`}>
                                <p className={`text-xs font-bold leading-tight italic ${!board.id ? 'text-slate-400' : 'text-slate-700'}`}>
                                    "{!board.id ? 'Discovery card pending...' : (board.promo_text || 'Active promotion...')}"
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-1">
                                <button 
                                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors shadow-lg active:scale-95 ${!board.id ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                                    disabled={!board.id}
                                >
                                    {!board.id ? 'Hold' : 'Claim'}
                                </button>
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                                    ))}
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[7px] font-black border-2 border-white">+3</div>
                                </div>
                            </div>
                         </div>
                      </div>
                  ))}
              </div>
          )}
      </section>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
