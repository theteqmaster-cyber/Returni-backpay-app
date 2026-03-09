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
      const res = await fetch(`/api/merchants?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Merchant not found');
      }

      localStorage.setItem('returni_merchant_id', data.id);
      localStorage.setItem('returni_merchant_name', data.business_name);
      router.push('/merchant/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-returni-cream">
      <Link href="/" className="text-returni-orange text-sm mb-6 inline-block">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold text-returni-dark mb-2">
        Merchant Login
      </h1>
      <p className="text-returni-dark/70 mb-8">
        Enter your email to access your dashboard
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-returni-dark mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-returni-orange focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-returni-orange text-white font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-sm text-returni-dark/60">
        New merchant?{' '}
        <Link href="/merchant/setup" className="text-returni-orange underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
