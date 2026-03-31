'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [traders, setTraders] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ error: '', success: false });

  const fetchData = async () => {
    if (!merchantId) return;
    try {
      const [reportRes, merchantRes, tradersRes, agentsRes] = await Promise.all([
        fetch(`/api/merchant/report?merchantId=${merchantId}`).then(r => r.json()),
        fetch(`/api/admin/merchants/${merchantId}`).then(r => r.json()),
        fetch('/api/admin/traders').then(r => r.json()),
        fetch('/api/admin/agents').then(r => r.json())
      ]);

      setData(reportRes);
      setMerchant(merchantRes);
      setTraders(Array.isArray(tradersRes) ? tradersRes : []);
      setAgents(Array.isArray(agentsRes) ? agentsRes : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [merchantId]);

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateStatus({ error: '', success: false });

    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trader_id: merchant.trader_id,
          agent_id: merchant.agent_id,
          backpay_percent: merchant.backpay_percent
        })
      });
      
      if (!res.ok) throw new Error('Failed to update assignments');
      
      setUpdateStatus({ error: '', success: true });
      fetchData(); // Refresh everything
    } catch (err: any) {
      setUpdateStatus({ error: err.message, success: false });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <main className="min-h-screen p-6 bg-returni-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-returni-green/20 border-t-returni-green rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing merchant data...</p>
      </div>
    </main>
  );

  if (!data || data.error) return (
    <main className="min-h-screen p-6 bg-returni-bg flex items-center justify-center">
      <p className="text-red-500 font-bold">{data?.error || 'Merchant not found.'}</p>
    </main>
  );

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Link href="/admin/merchants" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
            ← Back to Merchants
          </Link>
          <h1 className="text-4xl font-black text-returni-dark tracking-tight">{data.merchant.business_name}</h1>
          <p className="text-returni-dark/60 text-sm mt-1 font-bold">{data.merchant.owner_name} • {data.merchant.email}</p>
        </div>
        <div className="text-right">
           <span className="bg-returni-dark text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
             Merchant ID: {merchantId.split('-')[0]}
           </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-returni-green text-white rounded-3xl p-6 shadow-xl shadow-green-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full scale-110 -mr-10 -mt-10"></div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Transactions</p>
              <p className="text-4xl font-black">{data.summary.totalCount}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Total Volume</p>
              <p className="text-3xl font-black text-returni-dark">${Number(data.summary.totalVolume).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Backpay Ratio</p>
              <p className="text-3xl font-black text-returni-blue">{data.merchant.backpay_percent || 3}%</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-black text-returni-dark uppercase tracking-widest text-xs">Transaction Activity</h2>
              <span className="text-[10px] font-bold text-gray-400">Showing all records</span>
            </div>
            {data.transactions.length === 0 ? (
              <div className="p-16 text-center text-gray-300 font-bold italic uppercase tracking-widest text-xs">No transactions recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                      <th className="text-left p-6">ID</th>
                      <th className="text-left p-6">Timestamp</th>
                      <th className="text-right p-6">Sale Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.transactions.map((tx: any, i: number) => {
                      const d = new Date(tx.created_at);
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-6 text-xs text-gray-300 font-mono">#{tx.id.split('-')[0]}</td>
                          <td className="p-6">
                             <p className="text-sm font-bold text-returni-dark">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                             <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="p-6 text-lg font-black text-returni-green text-right">${Number(tx.amount).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Assignments */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 sticky top-6">
              <h3 className="font-black text-returni-dark text-lg mb-6 leading-tight flex items-center gap-2">
                 <span className="w-1 h-6 bg-returni-green rounded-full"></span>
                 Management Console
              </h3>
              
              <form onSubmit={handleUpdateAssignment} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Portfolio Assignment (Trader)</label>
                    <select 
                      value={merchant?.trader_id || ""} 
                      onChange={e => setMerchant({...merchant, trader_id: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-returni-dark outline-none font-bold text-sm"
                    >
                       <option value="">Independent Branch</option>
                       {traders.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.users?.full_name} ({t.users?.email})</option>
                       ))}
                    </select>
                    <p className="text-[9px] text-gray-400 mt-2 font-medium italic">Assigning to a Trader switches the account to the $20 Multi-Branch platform fee.</p>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Responsible Agent</label>
                    <select 
                      value={merchant?.agent_id || ""} 
                      onChange={e => setMerchant({...merchant, agent_id: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-returni-dark outline-none font-bold text-sm"
                    >
                       <option value="">No Agent Assigned</option>
                       {agents.map((a: any) => (
                          <option key={a.id} value={a.id}>{a.users?.full_name}</option>
                       ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Backpay Royalty %</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={merchant?.backpay_percent || 3} 
                      onChange={e => setMerchant({...merchant, backpay_percent: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-returni-dark outline-none font-bold text-sm"
                    />
                 </div>

                 {updateStatus.error && <p className="text-red-500 text-xs font-bold leading-relaxed">{updateStatus.error}</p>}
                 {updateStatus.success && <p className="text-green-600 text-xs font-black uppercase tracking-widest">Changes saved successfully!</p>}

                 <button 
                  disabled={updating}
                  type="submit" 
                  className="w-full bg-returni-dark text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
                 >
                    {updating ? 'Saving Changes...' : 'Save Management Profile'}
                 </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-100">
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                   Changes to portfolio assignment will reflect instantly on the Trader's dashboard.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
