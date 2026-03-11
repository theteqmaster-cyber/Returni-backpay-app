'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-returni-bg to-green-50/50">
      <div className="text-center max-w-md w-full">
        {/* Logo Placement */}
        <div className="flex justify-center mb-6">
           <Image
             src="/logo.jpg"
             alt="RETURNi Logo"
             width={180}
             height={180}
             className="rounded-3xl shadow-xl border-4 border-white object-cover aspect-square"
             priority
           />
        </div>
        
        <h1 className="text-4xl font-extrabold text-returni-dark mb-3 tracking-tight">
          RETURN<span className="text-returni-green">i</span>
        </h1>
        <p className="text-returni-dark/70 mb-10 text-lg">
          The simple customer retention platform for local businesses.
        </p>

        <div className="space-y-4">
          <Link
            href="/merchant/login"
            className="block w-full py-4 px-6 rounded-2xl bg-returni-green text-white font-semibold text-lg shadow-lg shadow-green-600/30 hover:bg-returni-darkGreen transition-all transform hover:-translate-y-0.5"
          >
            Merchant Login
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/merchant/setup"
              className="block w-full py-4 px-6 rounded-2xl border-2 border-returni-blue text-returni-blue font-semibold text-center hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/scan"
              className="block w-full py-4 px-6 rounded-2xl border-2 border-returni-dark text-returni-dark font-semibold text-center hover:bg-gray-50 transition-colors"
            >
              Redeem QR
            </Link>
          </div>
        </div>

        <p className="mt-12 text-sm text-returni-dark/50 font-medium tracking-wide uppercase">
          Digital Loyalty &bull; Automated Backpay
        </p>
      </div>
    </main>
  );
}
