'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PulseGraph from '@/components/PulseGraph';

interface WeekData {
  label: string;
  dateRange: string;
  totalSales: string;
  totalCount: number;
  days: { day: string; count: number }[];
  weekStart: string;
}

export default function MerchantAnalyticsPage() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchWeeks = async (pageNum: number) => {
    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) {
      console.error('No merchantId found');
      return;
    }

    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/analytics/weekly?merchantId=${merchantId}&page=${pageNum}`);
      const data = await res.json();
      
      if (pageNum === 0) {
        setWeeks(data.weeks || []);
      } else {
        setWeeks(prev => [...prev, ...(data.weeks || [])]);
      }
      
      setHasMore(data.hasMore);
      setPage(data.nextPage);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWeeks(0);
  }, []);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/merchant/dashboard" className="text-returni-green font-medium text-sm hover:underline">
          &larr; Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-returni-dark mb-1 tracking-tight">Advanced Analytics</h1>
        <p className="text-returni-dark/60 text-sm font-medium uppercase tracking-widest">Weekly Heartbeat History</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-returni-green/20 border-t-returni-green rounded-full animate-spin"></div>
            <p className="mt-4 text-returni-dark/40 font-black text-xs uppercase tracking-widest">Compiling Pulse Data...</p>
          </div>
        ) : weeks.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
             <p className="text-returni-dark/40 font-black text-xs uppercase tracking-widest italic">No sales recorded yet.</p>
          </div>
        ) : (
          weeks.map((week, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-returni-green/5 rounded-full -mr-12 -mt-12"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-black text-returni-dark leading-tight">{week.label}</h2>
                  <p className="text-returni-dark/40 text-[10px] font-bold uppercase tracking-widest">{week.dateRange}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-returni-green">${week.totalSales}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{week.totalCount} Transactions</p>
                </div>
              </div>

              <div className="mt-6 mb-2">
                <PulseGraph data={week.days} height={100} showDots={true} animate={true} />
              </div>

              <div className="flex justify-between mt-2 pt-4 border-t border-gray-50">
                {week.days.map((d, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase mb-1">{d.day}</p>
                    <p className={`text-[10px] font-bold ${d.count > 0 ? 'text-returni-green' : 'text-gray-200'}`}>
                      {d.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {hasMore && !loading && (
          <button
            onClick={() => fetchWeeks(page)}
            disabled={loadingMore}
            className="w-full py-4 text-sm font-black text-returni-dark uppercase tracking-widest bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loadingMore ? 'Loading More Weeks...' : 'Load Previous Weeks'}
          </button>
        )}
      </div>

      <p className="mt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
        &copy; {new Date().getFullYear()} RETURNi Backpay Platform
      </p>
    </main>
  );
}
