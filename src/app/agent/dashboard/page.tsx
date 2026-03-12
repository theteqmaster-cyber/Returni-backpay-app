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
    pendingFees: { USD: "0.00", ZAR: "0.00", ZIG: "0.00" },
    payoutBreakdown: { recruitment: "0.00", servicing: "0.00", total: "0.00" },
    monthlySignups: 0,
    monthlyTarget: 10,
    recentActivity: [] as any[],
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

  const openWhatsApp = (phone: string, businessName: string) => {
    const message = `Hi ${businessName}, this is your RETURNi Agent. How is everything going today?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
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

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-returni-dark/60 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Goal</p>
            <h2 className="text-xl font-black text-returni-dark tracking-tight">Recruitment Target</h2>
          </div>
          <p className="text-sm font-black text-returni-green">{stats.monthlySignups} / {stats.monthlyTarget}</p>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-returni-green h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            style={{ width: `${Math.min((stats.monthlySignups / stats.monthlyTarget) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 font-medium mt-3 italic">
          {stats.monthlySignups >= stats.monthlyTarget ? "🏆 Goal achieved! Keep pushing for bonus rewards." : `Sign up ${stats.monthlyTarget - stats.monthlySignups} more merchants to hit your target.`}
        </p>
      </div>

      <p className="text-returni-dark/60 text-xs font-black uppercase tracking-widest mb-6">Performance & Activity</p>

      <div className="flex flex-col gap-4 mb-4">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 border-l-4 border-l-returni-green">
           <div className="flex justify-between items-start mb-4">
              <div>
                 <p className="text-returni-dark/60 text-[10px] font-black uppercase tracking-wider mb-2">Total Expected Payout</p>
                 <span className="text-4xl font-black text-returni-dark">${loading ? '...' : (stats.pendingFees as any)?.USD ?? '0.00'}</span>
              </div>
              <div className="bg-returni-green/10 px-3 py-1 rounded-full text-returni-green text-[10px] font-black uppercase">Current Model</div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recruitment</p>
                 <p className="text-xl font-black text-returni-dark">${stats.payoutBreakdown.recruitment}</p>
                 <p className="text-[9px] text-gray-400 font-medium">($5.00 x {stats.activeMerchants})</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Servicing</p>
                 <p className="text-xl font-black text-returni-dark">${stats.payoutBreakdown.servicing}</p>
                 <p className="text-[9px] text-gray-400 font-medium">($1.50 x {stats.activeMerchants})</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-[10px] font-black uppercase tracking-wider mb-2">Active Merchants</p>
          <p className="text-3xl font-black text-returni-green">{loading ? '...' : stats.activeMerchants}</p>
        </div>
      </div>

      {/* Recent Merchant Activity Feed */}
      <div className="bg-returni-dark rounded-2xl p-6 shadow-lg mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
        </div>
        <h2 className="font-black text-lg mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Live Activity Feed
        </h2>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium italic">No recent transactions from your merchants.</p>
        ) : (
          <div className="space-y-4">
            {stats.recentActivity.slice(0, 3).map((activity: any) => (
              <div key={activity.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <div>
                  <p className="text-xs font-bold text-gray-100">{activity.merchants?.business_name}</p>
                  <p className="text-[10px] text-gray-400">{new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="text-sm font-black text-returni-green">
                  {activity.currency === 'USD' ? '$' : activity.currency + ' '}
                  {Number(activity.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
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
               <li key={m.id} className="border border-gray-100 rounded-xl p-4 shadow-sm relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-returni-dark text-lg">{m.business_name}</h3>
                      <p className="text-xs text-gray-500 font-medium">{m.phone || m.email}</p>
                    </div>
                    {m.phone && (
                      <button 
                        onClick={() => openWhatsApp(m.phone, m.business_name)}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                        title="Message via WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.411.002 12.048c0 2.12.54 4.19 1.563 6.023L0 24l6.135-1.61a11.771 11.771 0 005.915 1.594h.005c6.637 0 12.05-5.414 12.052-12.052 0-3.213-1.252-6.234-3.53-8.513z"></path></svg>
                      </button>
                    )}
                  </div>

                  {/* Merchant Performance Badges */}
                  <div className="flex gap-2 mb-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col items-center min-w-[60px]">
                      <span className="text-[10px] text-gray-400 font-black uppercase">Volume</span>
                      <span className="text-xs font-black text-returni-green">${Number(m.stats?.USD || 0).toFixed(0)}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 flex flex-col items-center min-w-[60px]">
                      <span className="text-[10px] text-gray-400 font-black uppercase">Sales</span>
                      <span className="text-xs font-black text-returni-dark">{m.stats?.count || 0}</span>
                    </div>
                  </div>
                  
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
