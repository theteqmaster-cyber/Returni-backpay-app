'use client';

import React, { useEffect, useState } from 'react';
import PulseGraph from '@/components/PulseGraph';

interface WeekData {
  label: string;
  dateRange: string;
  totalSales: string;
  totalCount: number;
  days: { day: string; count: number }[];
  weekStart: string;
}

export default function AnalyticsPanel() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchWeeks = async (pageNum: number) => {
    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) return;

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
      console.error('Analytics panel error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWeeks(0);
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-4 border-returni-green/20 border-t-returni-green rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-returni-dark/30">Compiling Pulse...</p>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="py-16 text-center px-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-returni-dark/30 italic">
          No sales recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      {weeks.map((week, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-returni-green/5 rounded-full -mr-8 -mt-8" />

          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-sm font-black text-returni-dark leading-tight">{week.label}</h3>
              <p className="text-returni-dark/40 text-[9px] font-bold uppercase tracking-widest">{week.dateRange}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-returni-green">${week.totalSales}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{week.totalCount} Tx</p>
            </div>
          </div>

          <div className="mt-3 mb-1">
            <PulseGraph data={week.days} height={80} showDots={true} animate={true} />
          </div>

          <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
            {week.days.map((d, i) => (
              <div key={i} className="text-center">
                <p className="text-[7px] font-black text-gray-300 uppercase mb-0.5">{d.day}</p>
                <p className={`text-[9px] font-bold ${d.count > 0 ? 'text-returni-green' : 'text-gray-200'}`}>
                  {d.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => fetchWeeks(page)}
          disabled={loadingMore}
          className="w-full py-3 text-[10px] font-black text-returni-dark uppercase tracking-widest bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load Previous Weeks'}
        </button>
      )}
    </div>
  );
}
