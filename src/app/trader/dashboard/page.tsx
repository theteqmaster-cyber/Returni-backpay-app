'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PulseGraph from '@/components/PulseGraph';

export default function TraderDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    totalVol: { USD: "0.00", ZAR: "0.00", ZIG: "0.00" },
    dailySales: [] as any[],
    merchants: [] as any[],
    recentTransactions: [] as any[],
    hasMore: false,
    growth: 0,
    platformFee: "20.00"
  });
  const [error, setError] = useState<string>('');

  const fetchStats = useCallback(async (isRefresh = false) => {
    const traderId = localStorage.getItem('returni_trader_id');
    if (!traderId) return;

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`/api/trader/stats?traderId=${traderId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const [traderFeedPage, setTraderFeedPage] = useState(0);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);

  const loadMoreTransactions = async () => {
    const traderId = localStorage.getItem('returni_trader_id');
    if (!traderId || stats.hasMore === false) return;

    try {
      setLoadingMoreFeed(true);
      const nextPage = traderFeedPage + 1;
      const res = await fetch(`/api/trader/stats?traderId=${traderId}&page=${nextPage}`);
      const data = await res.json();
      
      setStats(prev => ({
        ...data,
        recentTransactions: [...prev.recentTransactions, ...data.recentTransactions],
        // Preserve previous chart/KPI data from the first page
        todaySalesCount: prev.todaySalesCount,
        totalVol: prev.totalVol,
        dailySales: prev.dailySales,
        merchants: prev.merchants
      }));
      setTraderFeedPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreFeed(false);
    }
  };

  useEffect(() => {
    const traderId = localStorage.getItem('returni_trader_id');
    const name = localStorage.getItem('returni_user_name');
    
    if (!traderId) {
       router.push('/trader/login');
       return;
    }
    
    if (name) setUserName(name);
    fetchStats();

    // Auto-refresh every 60 seconds (only first page)
    const interval = setInterval(() => {
      if (traderFeedPage === 0) fetchStats(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [router, fetchStats, traderFeedPage]);

  const isRecentlyActive = (lastActive: string | null) => {
    if (!lastActive) return false;
    const last = new Date(lastActive);
    const now = new Date();
    return (now.getTime() - last.getTime()) < (2 * 60 * 60 * 1000); // 2 hours
  };

  const topBranch = stats.merchants.length > 0 
    ? [...stats.merchants].sort((a, b) => b.todayCount - a.todayCount)[0]
    : null;

  return (
    <main className="min-h-screen p-6 bg-[#f8fafc] max-w-lg mx-auto font-sans">
      {/* Premium Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="group flex items-center gap-2 text-returni-dark/40 hover:text-returni-green transition-all">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-returni-green transition-colors">
            &larr;
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Home</span>
        </Link>
        <div className="flex gap-2">
           <button
             onClick={() => {
               setTraderFeedPage(0);
               fetchStats(true);
             }}
             disabled={refreshing}
             className={`p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-returni-dark/60 hover:text-returni-green transition-all ${refreshing ? 'animate-spin' : ''}`}
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           </button>
           <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                localStorage.removeItem('returni_trader_id');
                router.push('/trader/login');
              });
            }}
            className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm hover:text-red-500 transition-colors"
          >
            Portal Exit
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-returni-dark tracking-tight mb-2">Portfolio View</h1>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-returni-green rounded-full animate-pulse shadow-[0_0_8px_rgba(46,125,50,0.5)]"></div>
           <p className="text-returni-dark/40 text-xs font-black uppercase tracking-[0.2em]">{userName || 'TRADER PORTFOLIO'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-3xl mb-8 flex items-center gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* Real-time KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden group">
          <div className="absolute top-4 right-6 transition-transform group-hover:scale-110">
             {stats.growth >= 0 ? (
               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+{stats.growth}%</span>
             ) : (
               <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{stats.growth}%</span>
             )}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Activity Index</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-slate-900 leading-none">{loading ? '...' : stats.todaySalesCount}</p>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Units</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-returni-green/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Volume</p>
          <div className="flex flex-col">
             <p className="text-2xl font-black text-white leading-none mb-2">${loading ? '...' : stats.totalVol.USD}</p>
             <div className="flex gap-2">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">ZAR {stats.totalVol.ZAR}</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter text-returni-green">ZiG {stats.totalVol.ZIG}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Portfolio Pulse Visual */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-white mb-8 relative group/card">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Collective Momentum</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Cross-Branch Heartbeat</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl flex items-center gap-2 group-hover/card:bg-slate-100 transition-colors">
             <div className="w-1.5 h-1.5 bg-returni-green rounded-full animate-ping"></div>
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>

        <div className="relative h-44 group-hover/card:scale-[1.02] transition-transform duration-500">
           {loading ? (
             <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-3xl animate-pulse">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Calibrating Data...</span>
             </div>
           ) : (
             <PulseGraph data={stats.dailySales} height={176} showDots={true} />
           )}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
           <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Star Performance</p>
              <p className="text-sm font-black text-slate-900">{topBranch?.business_name || 'Calculating...'}</p>
           </div>
           <div className="text-right">
              <span className="text-xs font-black text-returni-green">🥇 Leaderboard Rank #1</span>
           </div>
        </div>
      </div>

      {/* Portfolio Live Feed */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-white mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Live Activity Feed</h2>
          <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest">Portfolio Stream</span>
        </div>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border-b border-slate-50 pb-4">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>)
          ) : stats.recentTransactions.length > 0 ? (
            <>
              {stats.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-lg">
                      ✨
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{tx.branch_name}</p>
                      <p className="text-sm font-black text-slate-900">${parseFloat(tx.amount).toFixed(2)} Sale</p>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              
              {(stats as any).hasMore && (
                <button
                  onClick={loadMoreTransactions}
                  disabled={loadingMoreFeed}
                  className="w-full py-3 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-returni-green transition-colors flex items-center justify-center gap-2"
                >
                  {loadingMoreFeed ? (
                     <div className="w-3 h-3 border-2 border-slate-200 border-t-returni-green rounded-full animate-spin"></div>
                  ) : 'Load Previous Activity ↓'}
                </button>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-300 font-bold italic text-sm">No sales stream detected.</div>
          )}
        </div>
      </div>

      {/* Individual Branch Insights */}
      <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.34em] mb-6 translate-x-1">Portfolio Infrastructure</h2>
      <div className="space-y-4 mb-20">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-[2rem] animate-pulse"></div>)
        ) : stats.merchants.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm border-dashed">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                🏗️
             </div>
             <h4 className="text-sm font-black text-slate-900 mb-1 tracking-tight">No Branches Assigned</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
               Contact your administrator to link merchant branches to your portfolio.
             </p>
          </div>
        ) : stats.merchants.map((m: any) => {
          const active = isRecentlyActive(m.lastActive);
          return (
            <Link key={m.id} href={`/trader/merchants/${m.id}/transactions`} className="block">
              <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 border border-white flex justify-between items-center active:scale-[0.98] transition-all hover:border-returni-green/30 group/branch">
                <div className="flex items-center gap-5">
                  <div className="relative">
                      <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-2xl group-hover/branch:bg-returni-green/5 transition-colors">
                        🏪
                      </div>
                      {active && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className="w-2.5 h-2.5 bg-returni-green rounded-full animate-pulse shadow-[0_0_4px_#2E7D32]"></div>
                        </div>
                      )}
                  </div>
                  <div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{m.business_name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.todayCount} Sales Today</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {active ? 'Live Now' : 'Idle'}
                        </span>
                      </div>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-returni-green transition-colors">${m.totalVolume}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Deep Dive &rarr;</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>


      <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-returni-green/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
        <div className="flex justify-between items-end relative z-10">
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Portfolio Management Fee</p>
              <p className="text-4xl font-black">${stats.platformFee}<span className="text-sm text-slate-500 font-bold ml-1">/ mo</span></p>
           </div>
           <div className="text-right">
              <span className="bg-returni-green/20 text-returni-green px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 inline-block border border-returni-green/30">Auto-Billed</span>
              <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Secured via RETURNi</p>
           </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
        <Link 
          href="/support" 
          className="w-full py-5 rounded-3xl bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-returni-green hover:border-returni-green/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm"
        >
          <span>Support & System Feedback</span>
          <div className="w-1.5 h-1.5 bg-returni-green rounded-full animate-pulse shadow-[0_0_8px_rgba(46,125,50,0.4)]"></div>
        </Link>
        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-12 py-10 opacity-60">
          &copy; {new Date().getFullYear()} RETURNi TRADER PORTFOLIO SYSTEM
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
