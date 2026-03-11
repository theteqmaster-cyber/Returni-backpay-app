'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userFullName, setUserFullName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMerchants: 0,
    totalAgents: 0,
    totalRevenue: '0.00',
    totalLiability: '0.00'
  });
  const [chartData, setChartData] = useState<{ label: string; volume: number; count: number }[]>([]);

  useEffect(() => {
    const name = localStorage.getItem('returni_user_name');
    if (name) setUserFullName(name);

    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/revenue-chart').then(r => r.json()),
    ]).then(([statsData, chartRaw]) => {
      if (!statsData.error) setStats(statsData);
      if (Array.isArray(chartRaw)) setChartData(chartRaw);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const maxVolume = Math.max(...chartData.map(d => d.volume), 1);

  const navTiles = [
    { href: '/admin/merchants', label: 'Manage Merchants', icon: '🏪', desc: 'Add & view all merchants', color: 'bg-returni-green' },
    { href: '/admin/agents', label: 'Manage Agents', icon: '👤', desc: 'Add & view all agents', color: 'bg-returni-blue' },
    { href: '/admin/agents/performance', label: 'Agent Leaderboard', icon: '🏆', desc: 'Ranked by sales volume', color: 'bg-yellow-500' },
    { href: '/admin/transactions', label: 'Transaction Log', icon: '📋', desc: 'All platform transactions', color: 'bg-purple-500' },
    { href: '/admin/backpay', label: 'Backpay Liability', icon: '⚠️', desc: 'Unclaimed backpay by merchant', color: 'bg-red-500' },
    { href: '/admin/fees', label: 'Platform Fees', icon: '💳', desc: 'Monthly fee payment status', color: 'bg-orange-500' },
    { href: '/admin/commissions', label: 'Agent Commissions', icon: '💰', desc: 'Review & mark payouts', color: 'bg-emerald-600' },
    { href: '/admin/audit-log', label: 'Audit Log', icon: '🔍', desc: 'Admin action history', color: 'bg-gray-600' },
  ];

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">
            Welcome, {userFullName || 'Admin'}
          </h1>
          <p className="text-returni-dark/50 text-sm font-medium mt-1">RETURNi Admin Console</p>
        </div>
        <button
          onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/admin/login'))}
          className="text-returni-dark/60 text-sm font-bold bg-white px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Log out
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Merchants', value: stats.totalMerchants, color: 'text-returni-green', prefix: '' },
          { label: 'Total Agents', value: stats.totalAgents, color: 'text-returni-blue', prefix: '' },
          { label: 'Platform Revenue', value: stats.totalRevenue, color: 'text-returni-dark', prefix: '$' },
          { label: 'Backpay Liability', value: stats.totalLiability, color: 'text-red-500', prefix: '$' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className={`text-3xl font-black ${card.color}`}>{loading ? '...' : `${card.prefix}${card.value}`}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-extrabold text-returni-dark text-lg">Revenue (Last 6 Months)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Total transaction volume processed on platform</p>
          </div>
          <Link href="/admin/transactions" className="text-xs font-bold text-returni-blue hover:text-blue-700 transition-colors">View All →</Link>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center text-gray-300 animate-pulse">Loading chart...</div>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {chartData.map((d, i) => {
              const heightPct = maxVolume > 0 ? (d.volume / maxVolume) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-returni-dark opacity-80">
                    {d.volume > 0 ? `$${d.volume.toFixed(0)}` : ''}
                  </span>
                  <div className="w-full rounded-t-lg transition-all duration-700 relative group" style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: heightPct > 0 ? '#2E7D32' : '#E5E7EB' }}>
                    {d.count > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-returni-dark text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                        {d.count} sales
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-400">{d.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Tiles */}
      <h2 className="font-extrabold text-returni-dark text-lg mb-4">Admin Sections</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {navTiles.map(tile => (
          <Link
            key={tile.href}
            href={tile.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${tile.color} flex items-center justify-center text-xl mb-3 shadow-sm`}>
              {tile.icon}
            </div>
            <p className="font-bold text-returni-dark text-sm group-hover:text-returni-green transition-colors">{tile.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{tile.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
