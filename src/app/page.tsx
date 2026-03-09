'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-returni-cream to-orange-100">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-returni-orange mb-2">RETURNi</h1>
        <p className="text-returni-dark/80 mb-8">
          Customer retention platform for local businesses
        </p>

        <div className="space-y-4">
          <Link
            href="/merchant/setup"
            className="block w-full py-4 px-6 rounded-xl bg-returni-orange text-white font-semibold text-lg shadow-lg hover:bg-orange-600 transition"
          >
            Merchant Setup
          </Link>
          <Link
            href="/scan"
            className="block w-full py-4 px-6 rounded-xl border-2 border-returni-orange text-returni-orange font-semibold text-lg hover:bg-orange-50 transition"
          >
            Scan & Add Points
          </Link>
        </div>

        <p className="mt-8 text-sm text-returni-dark/60">
          QR codes • Phone capture • Points • Offline-first
        </p>
      </div>
    </main>
  );
}
