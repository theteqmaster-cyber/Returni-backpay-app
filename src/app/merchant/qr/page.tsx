'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  ssr: false,
});

export default function MerchantQRPage() {
  const router = useRouter();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('returni_merchant_id');
    const name = localStorage.getItem('returni_merchant_name');

    if (!id) {
      router.push('/merchant/login');
      return;
    }

    setMerchantId(id);
    setMerchantName(name || 'My Business');
  }, [router]);

  if (!merchantId) {
    return (
      <main className="min-h-screen p-6 bg-returni-cream flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    );
  }

  const scanUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/scan?merchantId=${merchantId}`
      : '';

  return (
    <main className="min-h-screen p-6 bg-returni-cream">
      <Link href="/merchant/dashboard" className="text-returni-orange text-sm mb-6 inline-block">
        ← Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-returni-dark mb-2">
        Your QR Code
      </h1>
      <p className="text-returni-dark/70 mb-8">
        Print this and place it at your counter. Customers scan to earn points.
      </p>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col items-center max-w-sm mx-auto">
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
          <QRCodeSVG value={scanUrl} size={200} level="M" />
        </div>
        <p className="text-returni-dark font-medium text-center">{merchantName}</p>
        <p className="text-returni-dark/50 text-sm mt-2 text-center">
          Scan to earn loyalty points
        </p>
      </div>

      <p className="mt-6 text-sm text-returni-dark/60 text-center">
        Or share: <span className="font-mono text-xs break-all">{scanUrl}</span>
      </p>
    </main>
  );
}
