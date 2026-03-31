'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SupportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    role: 'unknown'
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    // Attempt auto-fill from various possible storage keys
    const name = localStorage.getItem('returni_user_name') || '';
    const phone = localStorage.getItem('returni_user_phone') || '';
    
    let role = 'unknown';
    if (localStorage.getItem('returni_merchant_id')) role = 'merchant';
    else if (localStorage.getItem('returni_trader_id')) role = 'trader';
    else if (localStorage.getItem('returni_agent_id')) role = 'agent';

    setFormData(prev => ({ ...prev, name, phone, role }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStatus({ loading: false, success: true, error: '' });
      setTimeout(() => {
         // Go back to the appropriate dashboard
         if (formData.role === 'merchant') router.push('/merchant/dashboard');
         else if (formData.role === 'trader') router.push('/trader/dashboard');
         else router.push('/');
      }, 2000);
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center px-4">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">Support Hub</h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Reporting & Feedback</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/60 border border-white">
           {status.success ? (
              <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    ✅
                 </div>
                 <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Report Received</h2>
                 <p className="text-sm font-bold text-slate-400">Our team has been notified. Redirecting you back...</p>
              </div>
           ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-returni-dark outline-none font-bold text-sm transition-all"
                      placeholder="Enter full name"
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-returni-dark outline-none font-bold text-sm transition-all"
                      placeholder="+263..."
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Describe the Problem</label>
                    <textarea 
                      required 
                      rows={4}
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-returni-dark outline-none font-bold text-sm transition-all resize-none"
                      placeholder="Tell us what&apos;s happening..."
                    />
                 </div>

                 {status.error && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                       <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{status.error}</p>
                    </div>
                 )}

                 <button
                  disabled={status.loading}
                  type="submit"
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
                 >
                    {status.loading ? 'Sending Report...' : 'Submit to Admin'}
                 </button>
                 
                 <div className="text-center">
                    <Link href="/" className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors">
                       Cancel & Return
                    </Link>
                 </div>
              </form>
           )}
        </div>
        
        <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-10 opacity-50">
           RETURNi System Diagnostics &copy; 2026 
        </p>
      </div>
    </main>
  );
}
