'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManageMerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]); // For the dropdown
  
  const [formData, setFormData] = useState({
    name: '', business_name: '', email: '', phone: '', agent_id: '', backpay_percent: '3'
  });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/merchants').then(r => r.json()),
      fetch('/api/admin/agents').then(r => r.json())
    ]).then(([merchantsData, agentsData]) => {
      setMerchants(merchantsData.error ? [] : merchantsData);
      setAgents(agentsData.error ? [] : agentsData);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: '', success: false });

    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSubmitStatus({ loading: false, error: '', success: true });
      setFormData({ name: '', business_name: '', email: '', phone: '', agent_id: '', backpay_percent: '3' });
      
      // Refresh list
      const updated = await fetch('/api/admin/merchants').then(r => r.json());
      setMerchants(updated);
    } catch (err: any) {
      setSubmitStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-5xl mx-auto">
      <div className="mb-8">
         <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
            &larr; Back to Admin Dashboard
         </Link>
         <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">
           Manage Merchants
         </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="font-bold text-returni-dark tracking-tight text-lg mb-4">Add New Merchant</h2>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Owner Name</label>
                   <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-green outline-none" placeholder="Jane Doe"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Business Name</label>
                   <input required type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-green outline-none" placeholder="Jane's Coffee"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Login Email</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-green outline-none" placeholder="jane@example.com"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Phone</label>
                   <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-green outline-none" placeholder="+263 123 4567"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Assign Agent (Optional)</label>
                   <select value={formData.agent_id} onChange={e => setFormData({...formData, agent_id: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-green outline-none">
                     <option value="">-- No Agent --</option>
                     {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.users.full_name} ({a.users.email})</option>
                     ))}
                   </select>
                </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Backpay % <span className="text-gray-400 font-normal normal-case">(loyalty cashback per sale)</span>
                    </label>
                    <select value={formData.backpay_percent} onChange={e => setFormData({...formData, backpay_percent: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-green outline-none">
                      <option value="2">2% — Conservative (tight-margin businesses)</option>
                      <option value="3">3% — Recommended (most small businesses)</option>
                      <option value="4">4% — Strong incentive (cafes, salons)</option>
                      <option value="5">5% — Aggressive loyalty driver</option>
                    </select>
                 </div>
                {submitStatus.error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{submitStatus.error}</p>}
                {submitStatus.success && <p className="text-green-600 text-xs font-bold bg-green-50 p-2 rounded">Merchant created!</p>}

                <button disabled={submitStatus.loading} type="submit" className="w-full bg-returni-green text-white font-bold py-3 rounded-xl hover:bg-returni-darkGreen transition-colors shadow-sm disabled:opacity-50">
                  {submitStatus.loading ? 'Saving...' : 'Create Merchant'}
                </button>
             </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-returni-dark tracking-tight">Registered Merchants ({merchants.length})</h2>
             </div>
             
             {loading ? <div className="p-8 text-center text-gray-400 font-medium">Loading...</div> : merchants.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-medium">No merchants found in database.</div>
             ) : (
                <ul className="divide-y divide-gray-100">
                   {merchants.map(m => (
                      <li key={m.id}>
                         <Link href={`/admin/merchants/${m.id}`} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-start block">
                            <div>
                               <h3 className="font-bold text-returni-dark text-lg">{m.business_name}</h3>
                               <p className="text-sm font-medium text-gray-500 mb-2">{m.owner?.full_name} • {m.email}</p>
                               <div className="flex gap-2 text-xs font-bold">
                                  <span className="bg-blue-50 text-returni-blue px-2 py-1 rounded-md border border-blue-100">{m.backpay_percent || 3}% Backpay</span>
                                  {m.agent && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md border border-purple-100">Agent: {m.agent.users.full_name}</span>}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">{m.id.split('-')[0]}</span>
                              <span className="text-gray-300 text-lg">→</span>
                            </div>
                         </Link>
                      </li>
                   ))}
                </ul>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}
