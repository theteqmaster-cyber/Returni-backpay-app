'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManageAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(data => {
        setAgents(data.error ? [] : data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: '', success: false });

    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSubmitStatus({ loading: false, error: '', success: true });
      setFormData({ full_name: '', email: '', phone: '' });
      
      // Refresh list
      const updated = await fetch('/api/admin/agents').then(r => r.json());
      setAgents(updated);
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
           Manage Agents
         </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="font-bold text-returni-dark tracking-tight text-lg mb-4">Add New Agent</h2>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
                   <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-dark outline-none" placeholder="John Agent"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Login Email</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-dark outline-none" placeholder="john@returni.app"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Phone</label>
                   <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-returni-dark outline-none" placeholder="+263 123 4567"/>
                </div>

                {submitStatus.error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">{submitStatus.error}</p>}
                {submitStatus.success && <p className="text-green-600 text-xs font-bold bg-green-50 p-2 rounded">Agent created!</p>}

                <button disabled={submitStatus.loading} type="submit" className="w-full bg-returni-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-sm disabled:opacity-50">
                  {submitStatus.loading ? 'Saving...' : 'Create Agent Account'}
                </button>
             </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-returni-dark tracking-tight">Registered Agents ({agents.length})</h2>
             </div>
             
             {loading ? <div className="p-8 text-center text-gray-400 font-medium">Loading...</div> : agents.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-medium">No agents found in database.</div>
             ) : (
                <ul className="divide-y divide-gray-100">
                   {agents.map(a => (
                      <li key={a.id} className="p-6 hover:bg-gray-50 transition-colors">
                         <div className="flex justify-between items-center">
                            <div>
                               <h3 className="font-bold text-returni-dark text-lg">{a.users?.full_name}</h3>
                               <p className="text-sm font-medium text-gray-500">{a.users?.email} • {a.users?.phone || 'No phone'}</p>
                            </div>
                            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">Joined {new Date(a.created_at).toLocaleDateString()}</span>
                         </div>
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
