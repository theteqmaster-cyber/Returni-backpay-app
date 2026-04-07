'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoMerchantLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/demo/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Identity verification failed');
      }

      // Store context and navigate
      localStorage.setItem('demo_merchant_id', data.user.id);
      localStorage.setItem('demo_merchant_name', data.user.businessName || data.user.email);
      router.push('/demo-merchant/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative selection:bg-blue-500/30 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]"></div>

      {/* Header Logo */}
      <div className="mb-12 flex items-center gap-3 relative z-20">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic text-white shadow-2xl shadow-blue-600/30 ring-1 ring-white/20">R</div>
          <span className="font-black tracking-tighter text-2xl italic uppercase text-white">Returni <span className="text-blue-500">Merchant</span></span>
      </div>

      {/* Professional Glass Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 overflow-hidden">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="mb-10 flex justify-between items-start relative z-10">
           <Link href="/" className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] inline-flex items-center gap-3 hover:text-white transition-all group/back">
             <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/back:bg-white/10 transition-colors shadow-lg">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </div>
             Back to Discovery
           </Link>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest leading-none">Portal Live</span>
           </div>
        </div>

        <div className="mb-12 relative z-10">
           <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none mb-4">
             Merchant Portal
           </h1>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em]">Unified Business Node Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
              Business Email
            </label>
            <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-6 pr-6 py-5 rounded-[1.8rem] bg-white/5 border border-white/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white placeholder:text-slate-700 shadow-inner"
                  placeholder="name@business.app"
                />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
              Portal Security Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 rounded-[1.8rem] bg-white/5 border border-white/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white placeholder:text-slate-700 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[9px] uppercase font-black tracking-widest border border-red-500/10 animate-shake text-center shadow-2xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-[2.5rem] bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-95 shadow-2xl shadow-blue-600/20 group flex items-center justify-center gap-3 mt-4"
          >
            {loading ? 'Authorizing Access...' : 'Enter Portal'}
            {!loading && <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center relative z-10">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              New Merchant Node?{' '}
              <Link href="/demo-merchant/signup" className="text-blue-500 hover:text-blue-400 font-black transition-all">
                Register Business
              </Link>
            </p>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="mt-10 flex items-center gap-4 text-slate-700 relative z-20">
          <div className="h-px w-8 bg-slate-900"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Access Node 001</span>
          <div className="h-px w-8 bg-slate-900"></div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </main>
  );
}
