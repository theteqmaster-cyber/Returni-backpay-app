'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/agent-performance')
      .then(r => r.json())
      .then(d => { setAgents(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const totalVolume = agents.reduce((s, a) => s + Number(a.totalVolume), 0);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">Agent Performance</h1>
        <p className="text-returni-dark/60 text-sm mt-1">Leaderboard ranked by total merchant sales volume</p>
      </div>

      {/* Platform total */}
      <div className="bg-returni-green text-white rounded-2xl p-6 mb-8 flex items-center justify-between shadow-lg shadow-green-600/30">
        <div>
          <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">Platform-wide Agent Volume</p>
          <p className="text-4xl font-black">${totalVolume.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white/70 mb-1">Active Agents</p>
          <p className="text-4xl font-black">{agents.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-returni-dark">Agent Leaderboard</h2>
          <span className="text-xs text-gray-400 font-medium">1% commission on merchant volume</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No agents found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {agents.map((a, i) => (
              <div key={a.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${
                  i === 0 ? 'bg-yellow-400 text-white' :
                  i === 1 ? 'bg-gray-300 text-white' :
                  i === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-returni-green flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {a.name?.[0] || 'A'}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-bold text-returni-dark text-lg leading-tight">{a.name}</p>
                  <p className="text-sm text-gray-400">{a.email}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Merchants</p>
                    <p className="text-2xl font-black text-returni-dark">{a.merchantCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Volume</p>
                    <p className="text-2xl font-black text-returni-green">${Number(a.totalVolume).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Commission</p>
                    <p className="text-2xl font-black text-returni-blue">${Number(a.expectedCommission).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
