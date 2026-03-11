'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgentDashboardPage() {
  const router = useRouter();
  const [userFullName, setUserFullName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMerchants: 0,
    pendingFees: "0.00",
    merchants: [] as any[]
  });
  
  const [noteMerchantId, setNoteMerchantId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; merchantCount: number }[]>([]);

  useEffect(() => {
    const agentId = localStorage.getItem('returni_agent_id');
    const name = localStorage.getItem('returni_user_name');
    
    if (!agentId) {
       router.push('/agent/login');
       return;
    }
    
    if (name) setUserFullName(name);

    fetch(`/api/agent/stats?agentId=${agentId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch public leaderboard (no money figures)
    fetch('/api/admin/agent-performance')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setLeaderboard(d.map(a => ({ id: a.id, name: a.name, merchantCount: a.merchantCount })));
        }
      });
  }, [router]);

  const saveNote = async () => {
     if (!noteMerchantId) return;
     setSavingNote(true);
     try {
       await fetch('/api/agent/stats', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchantId: noteMerchantId, notes: tempNote })
       });
       
       // Update local state without full reload
       setStats(prev => ({
         ...prev,
         merchants: prev.merchants.map(m => m.id === noteMerchantId ? { ...m, internal_notes: tempNote } : m)
       }));
       setNoteMerchantId(null);
     } catch (err) {
       console.error(err);
     } finally {
       setSavingNote(false);
     }
  };

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">
          Welcome, {userFullName || 'Agent'}
        </h1>
        <button
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => {
               router.push('/agent/login')
            })
          }}
          className="text-returni-dark/60 text-sm font-bold bg-white px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Log out
        </button>
      </div>

      <p className="text-returni-dark/60 text-sm font-bold uppercase tracking-widest mb-6">Your Performance</p>

      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 mb-8 border-l-8 border-l-returni-green flex flex-col justify-center">
         <p className="text-returni-dark/60 text-sm font-bold uppercase tracking-wider mb-2">Expected Payout</p>
         <p className="text-5xl font-black text-returni-dark">${loading ? '...' : stats.pendingFees}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-bold mb-2">Active Merchants</p>
          <p className="text-3xl font-black text-returni-green">{loading ? '...' : stats.activeMerchants}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-bold mb-2">Total Merchant Vol</p>
          <p className="text-3xl font-black text-returni-green">${loading ? '...' : (stats as any).totalVolumeProcessed || '0.00'}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="font-bold text-returni-dark mb-4 text-xl">My Merchants</h2>
        
        {loading ? <div className="text-center py-4 text-gray-500">Loading...</div> : stats.merchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-50">
             <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             <p className="text-sm font-medium text-returni-dark">No merchants recruited yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {stats.merchants.map(m => (
               <li key={m.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative">
                  <h3 className="font-bold text-returni-dark text-lg">{m.business_name}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">{m.phone || m.email}</p>
                  
                  {noteMerchantId === m.id ? (
                     <div className="mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-2">Edit Internal Notes</p>
                        <textarea 
                           className="w-full h-24 p-2 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" 
                           value={tempNote}
                           onChange={e => setTempNote(e.target.value)}
                           placeholder="Write notes regarding physical visits, stock, etc..."
                        />
                        <div className="flex gap-2 mt-2">
                           <button onClick={saveNote} disabled={savingNote} className="bg-yellow-600 text-white px-4 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-yellow-700 disabled:opacity-50">
                             {savingNote ? 'Saving...' : 'Save Note'}
                           </button>
                           <button onClick={() => setNoteMerchantId(null)} className="bg-white text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50">
                             Cancel
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex justify-between items-start group">
                        <div className="flex-1 pr-4">
                           <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-1 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             Internal Notes
                           </p>
                           <p className="text-sm text-yellow-900 whitespace-pre-wrap leading-relaxed">
                             {m.internal_notes || <span className="text-yellow-700/50 italic">No notes added yet...</span>}
                           </p>
                        </div>
                        <button 
                           onClick={() => { setNoteMerchantId(m.id); setTempNote(m.internal_notes || ''); }}
                           className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 p-1.5 rounded-md text-xs font-bold shadow-sm"
                        >
                           Edit
                        </button>
                     </div>
                  )}
               </li>
            ))}
          </ul>
        )}
      </div>

      {/* Team Standings */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-returni-dark tracking-tight">🏆 Team Standings</h2>
            <p className="text-xs text-returni-dark/50 font-medium mt-0.5">Ranked by merchants recruited — keep climbing!</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium">Loading standings...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((agent, i) => {
                const isMe = agent.name === userFullName;
                const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];
                const rankColor = rankColors[i] || 'bg-gray-100';
                const rankTextColor = i < 3 ? 'text-white' : 'text-gray-400';
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${isMe ? 'bg-returni-green/5 border-l-4 border-returni-green' : 'hover:bg-gray-50'}`}
                  >
                    {/* Rank badge */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${rankColor} ${rankTextColor}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 ${isMe ? 'bg-returni-green' : 'bg-returni-dark/20'}`}>
                      {agent.name?.[0]?.toUpperCase() || 'A'}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isMe ? 'text-returni-green' : 'text-returni-dark'}`}>
                        {agent.name}
                        {isMe && <span className="ml-2 text-xs font-bold bg-returni-green text-white px-2 py-0.5 rounded-full">You</span>}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className={`text-2xl font-black ${isMe ? 'text-returni-green' : 'text-returni-dark'}`}>{agent.merchantCount}</p>
                      <p className="text-xs text-gray-400 font-medium">merchants</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
