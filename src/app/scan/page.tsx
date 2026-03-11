'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';

function ScanContent() {
  const router = useRouter();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('returni_merchant_id');
    setMerchantId(id);
  }, []);

  const processClaim = async (tokenString: string) => {
    if (!merchantId) return;

    // Extract token from URL if it's a full URL, or use token directly
    let finalToken = tokenString.trim();
    if (finalToken.includes('/bp/')) {
       finalToken = finalToken.split('/bp/')[1].split('?')[0];
    }

    if (!finalToken) {
       setError("Invalid token format.");
       return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: finalToken, merchantId })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setSuccessMsg(data.message);
      setManualToken('');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processClaim(manualToken);
  };

  if (!isMounted) return null;

  if (!merchantId) {
    return (
      <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center justify-center">
        <p className="text-returni-dark mb-4 text-lg font-medium">You must be logged in to claim points.</p>
        <Link href="/merchant/login" className="text-returni-green font-bold text-lg hover:text-returni-darkGreen transition-colors underline">
          Log in as merchant
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/merchant/dashboard" className="text-returni-green font-medium text-sm mb-6 inline-flex items-center hover:text-returni-darkGreen transition mt-4">
          &larr; Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
          <h1 className="text-3xl font-extrabold text-returni-dark mb-2 tracking-tight">
            Scan Backpay QR
          </h1>
          <p className="text-returni-dark/60 mb-8 font-medium">
            Scan a customer&apos;s backpay QR to redeem it.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold border border-red-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-bold border border-green-200 flex flex-col items-center gap-2 shadow-sm text-center">
               <svg className="w-8 h-8 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
               {successMsg}
            </div>
          )}

          <div className="mb-8 overflow-hidden rounded-3xl shadow-lg border-4 border-returni-lightGreen bg-black">
            <Scanner
              onScan={(result) => {
                 if (result && result.length > 0) {
                   const text = result[0].rawValue;
                   if (!loading && (!successMsg || (successMsg && Date.now() % 3000 < 500))) {
                      processClaim(text);
                   }
                 }
              }}
              onError={(error: unknown) => {
                if (error instanceof Error) console.error(error.message);
              }}
            />
          </div>

          <div className="relative mb-8 text-center">
            <span className="relative z-10 px-4 bg-white text-returni-dark/40 text-sm font-bold tracking-wider">OR ENTER MANUAL TOKEN</span>
            <div className="absolute left-0 top-1/2 w-full h-px bg-gray-200 -z-0"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green text-center font-mono text-lg font-bold outline-none transition-all"
                placeholder="Paste Token/Link Here"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !manualToken}
              className="w-full py-4 rounded-2xl bg-returni-dark text-white font-extrabold text-lg hover:bg-black disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-gray-400/30"
            >
              {loading ? 'Redeeming...' : 'Manual Redeem'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-6 bg-returni-bg flex items-center justify-center">
        <div className="animate-pulse text-returni-green font-bold text-xl">Loading...</div>
      </main>
    }>
      <ScanContent />
    </Suspense>
  );
}
