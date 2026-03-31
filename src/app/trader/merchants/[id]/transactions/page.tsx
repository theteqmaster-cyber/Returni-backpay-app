'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BranchTransactionsPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params?.id as string;
  
  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');

  const fetchBranchData = async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/trader/merchants/${merchantId}/transactions?page=${pageNum}`);
      const result = await res.json();
      
      if (result.error) throw new Error(result.error);

      if (isInitial) {
        setData(result);
        setTransactions(result.transactions);
      } else {
        setTransactions(prev => [...prev, ...result.transactions]);
        setData((prev: any) => ({ ...prev, hasMore: result.hasMore }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (merchantId) fetchBranchData(0, true);
  }, [merchantId]);

  if (loading) return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
       <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-returni-green rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Branch Audit...</p>
       </div>
    </main>
  );

  return (
    <main className="min-h-screen p-6 bg-[#f8fafc] max-w-lg mx-auto font-sans">
      <div className="mb-8 flex justify-between items-center">
        <Link href="/trader/dashboard" className="group flex items-center gap-2 text-returni-dark/40 hover:text-returni-green transition-all">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-returni-green transition-colors">
            &larr;
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Portfolio</span>
        </Link>
        <span className="text-[9px] font-black bg-returni-dark text-white px-3 py-1 rounded-full uppercase tracking-widest">Audit Mode</span>
      </div>

      <div className="mb-10">
         <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{data?.merchant?.business_name}</h1>
         <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Manager: {data?.merchant?.name}</p>
            <div className="w-1.5 h-1.5 bg-returni-green rounded-full shadow-[0_0_4px_#2E7D32]"></div>
         </div>
      </div>

      {/* Branch Stats Block */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl mb-10 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-40 h-40 bg-returni-green/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform"></div>
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Branch Volume Snapshot</p>
         <div className="grid grid-cols-2 gap-6">
            <div>
               <p className="text-3xl font-black text-white leading-none mb-1">${parseFloat(data?.summary?.totalVolume?.USD || 0).toLocaleString()}</p>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total USD</p>
            </div>
            <div className="text-right">
               <p className="text-xl font-black text-white leading-none mb-1">{data?.totalCount}</p>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">All Transactions</p>
            </div>
         </div>
         <div className="mt-6 pt-6 border-t border-slate-800 flex gap-4">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">ZAR {parseFloat(data?.summary?.totalVolume?.ZAR || 0).toFixed(2)}</span>
            <span className="text-[9px] font-black text-returni-green uppercase tracking-tighter">ZiG {parseFloat(data?.summary?.totalVolume?.ZIG || 0).toFixed(2)}</span>
         </div>
      </div>

      <div className="mb-6">
         <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Branch History Archive</h2>
         <div className="space-y-3">
            {transactions.map((tx: any, i: number) => {
               const d = new Date(tx.created_at);
               return (
                  <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex justify-between items-center group/tx hover:border-slate-300 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-300 group-hover/tx:text-returni-green transition-colors">
                           {i + 1}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900">${parseFloat(tx.amount).toFixed(2)} {tx.currency}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                             {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter block mb-1">TXID</span>
                        <span className="text-[9px] font-mono text-slate-400">#{tx.id.split('-')[0]}</span>
                     </div>
                  </div>
               );
            })}
         </div>

         {data?.hasMore && (
           <button
             onClick={() => {
               const next = page + 1;
               setPage(next);
               fetchBranchData(next);
             }}
             disabled={loadingMore}
             className="w-full py-6 mt-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-returni-green transition-all active:scale-95 flex items-center justify-center gap-3"
           >
             {loadingMore ? (
               <div className="w-3 h-3 border-2 border-slate-200 border-t-returni-green rounded-full animate-spin"></div>
             ) : 'Pull Older Records ↓'}
           </button>
         )}

         {transactions.length === 0 && !loading && (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-50 shadow-sm">
               <p className="text-slate-300 font-bold italic text-sm">This branch has no archived records.</p>
            </div>
         )}
      </div>

      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] py-10 opacity-60">
        Branch Data Integrity &copy; RETURNi TRADER
      </p>
    </main>
  );
}
