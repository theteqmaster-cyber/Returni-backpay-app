'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminTradersPage() {
  const [traders, setTraders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: false });

  const fetchTraders = async () => {
    try {
      const res = await fetch('/api/admin/traders');
      const data = await res.json();
      setTraders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: '', success: false });

    try {
      const res = await fetch('/api/admin/traders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitStatus({ loading: false, error: '', success: true });
      setFormData({ name: '', email: '', phone: '' });
      fetchTraders();
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
           Manage Portfolios (Traders)
         </h1>
         <p className="text-returni-dark/50 font-medium">Create and manage multi-branch owner accounts</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
             <h2 className="font-black text-returni-dark tracking-tight text-lg mb-6">Onboard New Trader</h2>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trader Name</label>
                   <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-returni-dark outline-none font-bold" placeholder="Full Name or Group Name"/>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Email</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-returni-dark outline-none font-bold" placeholder="trader@business.com"/>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone (Optional)</label>
                   <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-returni-dark outline-none font-bold" placeholder="+263..."/>
                </div>

                {submitStatus.error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{submitStatus.error}</p>}
                {submitStatus.success && <p className="text-green-600 text-xs font-bold bg-green-50 p-3 rounded-xl">Trader profile created!</p>}

                <button disabled={submitStatus.loading} type="submit" className="w-full bg-returni-dark text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-md disabled:opacity-50 mt-4 uppercase tracking-widest text-xs">
                  {submitStatus.loading ? 'Creating Account...' : 'Create Trader Profile'}
                </button>
             </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white overflow-hidden rounded-3xl shadow-xl border border-gray-100">
             <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-black text-returni-dark tracking-tight">Active Portfolio Owners ({traders.length})</h2>
             </div>
             
             {loading ? <div className="p-12 text-center text-gray-300 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Portfolio Data...</div> : traders.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-medium">No traders found. Onboard your first portfolio owner on the left.</div>
             ) : (
                <ul className="divide-y divide-gray-100">
                   {traders.map(t => (
                      <li key={t.id} className="group">
                         <div className="p-8 hover:bg-gray-50 transition-all flex justify-between items-center">
                            <div>
                               <h3 className="font-black text-returni-dark text-xl mb-1">{t.users?.full_name}</h3>
                               <p className="text-sm font-bold text-gray-400 mb-3">{t.users?.email}</p>
                               <div className="flex gap-2">
                                  <span className="bg-returni-dark text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                     {t.branchCount} {t.branchCount === 1 ? 'Branch' : 'Branches'}
                                  </span>
                                  <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                                     Portfolio Active
                                  </span>
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter decoration-1">
                                 UID: {t.id.split('-')[0]}
                               </p>
                               <Link 
                                href={`/admin/merchants`} 
                                className="text-xs font-black text-returni-green uppercase tracking-widest hover:underline"
                               >
                                Assign Branches →
                               </Link>
                            </div>
                         </div>
                      </li>
                   ))}
                </ul>
             )}
          </div>
          
          <div className="mt-8 bg-returni-dark text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
             <div className="absolute right-0 top-0 bottom-0 w-1 bg-returni-green"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-gray-400">Pro Tip</p>
             <p className="text-sm font-medium leading-relaxed opacity-90">
               To assign a merchant branch to a trader, navigate to **Manage Merchants**, select the specific merchant, and update their **Portfolio Assignment**.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
