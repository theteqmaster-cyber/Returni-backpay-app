'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoMerchantSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  // KYC fields
  const [idNumber, setIdNumber] = useState('');
  const [businessType, setBusinessType] = useState('Retail');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2); // Move to business identity step
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/demo/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, businessName })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Account creation failed');
      }

      // Store context and navigate
      localStorage.setItem('demo_merchant_id', data.user.id);
      localStorage.setItem('demo_merchant_name', data.user.businessName || data.user.email);
      router.push('/demo-merchant/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative selection:bg-blue-500/30 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]"></div>

      {/* Header Logo */}
      <div className="mb-12 flex items-center gap-3 relative z-20">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic text-white shadow-2xl shadow-blue-600/30 ring-1 ring-white/20">R</div>
          <span className="font-black tracking-tighter text-2xl italic uppercase text-white">Returni <span className="text-blue-500">Merchant</span></span>
      </div>

      {/* Professional Signup Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-white/5 relative z-10 overflow-hidden">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="mb-10 relative z-10">
           <Link href="/demo-merchant/login" className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] inline-flex items-center gap-3 hover:text-white transition-all group/back">
             <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/back:bg-white/10 transition-colors shadow-lg">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </div>
             Back to Login
           </Link>
        </div>

        <div className="mb-8 relative z-10">
           <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none mb-4">
             {step === 1 ? 'Registration' : 'Business Identity'}
           </h1>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em]">
             {step === 1 
               ? 'Join the Returni Unified Network' 
               : 'Verify your business credentials'}
           </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-2 mb-12 relative z-10">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step === 1 ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-blue-600/20'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step === 2 ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5'}`}></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-6 relative z-10">
          {step === 1 ? (
            <>
              <div className="space-y-2.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white placeholder:text-slate-700 shadow-inner"
                  placeholder="e.g. Acme Retail Solutions"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white placeholder:text-slate-700 shadow-inner"
                  placeholder="admin@business.app"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                  Portal Security Key
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white placeholder:text-slate-700 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                  National ID / Tax Number
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white placeholder:text-slate-700 shadow-inner"
                  placeholder="REG-100-XXXX-01"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                  Business Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-white/5 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-white shadow-inner appearance-none backdrop-blur-3xl"
                >
                  <option>Retail</option>
                  <option>Restaurant / Cafe</option>
                  <option>Service Provider</option>
                  <option>Wholesale</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-blue-600/5 border border-blue-600/10 italic text-blue-400 text-[9px] font-black uppercase tracking-widest leading-relaxed text-center">
                 Automated Merchant KYC in progress...
              </div>
            </>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/10 text-center shadow-2xl">
              {error}
            </div>
          )}

          <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-[2.5rem] bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] disabled:opacity-50 transition-all shadow-2xl shadow-blue-600/20 transform active:scale-95 group flex items-center justify-center gap-3"
              >
                {loading ? 'Processing...' : step === 1 ? 'Apply Credentials' : 'Create Merchant Account'}
                {!loading && <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </button>
              
              {step === 2 && (
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-slate-600 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-all"
                >
                  Back to Registration
                </button>
              )}
          </div>
        </form>
      </div>

      <div className="mt-12 flex items-center gap-4 text-slate-700 relative z-20">
          <div className="h-px w-8 bg-slate-900"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Unified Signup Node 001</span>
          <div className="h-px w-8 bg-slate-900"></div>
      </div>
    </main>
  );
}
