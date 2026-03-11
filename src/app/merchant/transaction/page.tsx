'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function NewTransactionPage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [successData, setSuccessData] = useState<{
    backpay_amount: number;
    qr_token: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const merchantId = localStorage.getItem('returni_merchant_id');
    if (!merchantId) {
       setError('Merchant not logged in');
       setLoading(false);
       return;
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone, merchantId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create transaction');
      
      setSuccessData({
        backpay_amount: data.backpay_amount,
        qr_token: data.qr_token
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
     const claimUrl = `${window.location.origin}/bp/${successData.qr_token}`;
     const whatsappText = `Hi! Thanks for visiting. Here is your RETURNi cashback claim link for $${successData.backpay_amount}: ${claimUrl}`;
     const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappText)}`;

      return (
       <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center pt-12">
         <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
           <div className="w-20 h-20 bg-green-50 text-returni-green rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-sm">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
           </div>
           <h2 className="text-2xl font-black text-returni-dark mb-1 tracking-tight">Sale Recorded</h2>
           <p className="text-returni-green font-bold text-lg mb-6 bg-green-50 py-2 rounded-xl border border-green-100 inline-block px-4">Generated ${successData.backpay_amount} backpay</p>
           
           <div className="bg-white flex justify-center p-6 rounded-3xl mb-6 border-2 border-gray-100 shadow-sm mx-auto max-w-[200px]">
             <QRCodeSVG value={claimUrl} size={150} />
           </div>

           <a 
             href={whatsappLink}
             target="_blank"
             rel="noopener noreferrer"
             className="block w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold mb-4 hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20"
           >
             Send via WhatsApp
           </a>

           <button
             onClick={() => {
               setSuccessData(null);
               setAmount('');
               setPhone('');
             }}
             className="block w-full py-4 rounded-2xl border-2 border-gray-200 text-returni-dark font-bold hover:bg-gray-50 transition-colors"
           >
             New Sale
           </button>
           
           <Link href="/merchant/dashboard" className="block mt-6 text-returni-blue font-medium hover:text-blue-700 transition">
             &larr; Back to Dashboard
           </Link>
         </div>
       </main>
     );
  }

  return (
    <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/merchant/dashboard" className="text-returni-green font-medium text-sm mb-6 inline-flex items-center hover:text-returni-darkGreen transition mt-4">
          &larr; Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-extrabold text-returni-dark mb-2 tracking-tight">
            New Sale
          </h1>
          <p className="text-returni-dark/60 mb-8 font-medium">
            Record a purchase to automatically generate 4% customer backpay.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-returni-dark mb-2">
                Purchase Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-2xl rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green font-black text-returni-dark outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-returni-dark mb-2">
                Customer WhatsApp Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green outline-none transition-all font-medium text-lg"
                placeholder="+263..."
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-returni-green text-white font-extrabold text-lg hover:bg-returni-darkGreen disabled:opacity-50 transition-all transform hover:-translate-y-0.5 mt-2 shadow-lg shadow-green-600/30"
            >
              {loading ? 'Processing...' : 'Record Transaction'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
