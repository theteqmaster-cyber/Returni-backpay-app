'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MerchantLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.role !== 'merchant_user' && data.role !== 'admin') {
         throw new Error('Not authorized as merchant');
      }

      localStorage.setItem('returni_merchant_id', data.merchant_id || '');
      router.push('/merchant/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="mb-8">
           <Link href="/" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors">
             &larr; Back to Home
           </Link>
        </div>

        <h1 className="text-3xl font-bold text-returni-dark mb-2">
          Merchant Login
        </h1>
        <p className="text-returni-dark/60 mb-8">
          Enter your email to access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-returni-dark mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-returni-green focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-returni-green text-white font-bold text-lg hover:bg-returni-darkGreen disabled:opacity-50 transition-colors shadow-md shadow-green-600/20 mt-4"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-returni-dark/60 font-medium">
          New merchant?{' '}
          <Link href="/merchant/setup" className="text-returni-blue hover:text-blue-700 underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
