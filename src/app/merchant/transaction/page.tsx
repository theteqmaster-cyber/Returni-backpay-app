'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import UnderDevelopmentPopup from '@/components/merchant/UnderDevelopmentPopup';

export default function NewTransactionPage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('+2637');
  const [currency, setCurrency] = useState<'USD' | 'ZAR' | 'ZIG'>('USD');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ECOCASH' | 'SWIPE'>('CASH');
  const [merchantNotes, setMerchantNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualBackpay, setManualBackpay] = useState('');
  
  const [showUnderDevInfo, setShowUnderDevInfo] = useState(false);
  
  const [successData, setSuccessData] = useState<{
    backpay_amount: number;
    qr_token: string;
    short_code: string;
    currency: string;
    merchant_name: string;
    amount: string;
    merchantNotes: string;
    promo_text?: string;
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
      const notes = merchantNotes.trim() === '' ? null : merchantNotes.trim();
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          phone, 
          merchantId, 
          currency, 
          payment_method: paymentMethod,
          merchantNotes: notes,
          manual_backpay_amount: manualBackpay || null
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create transaction');
      
      setSuccessData({
        backpay_amount: data.backpay_amount,
        qr_token: data.qr_token,
        short_code: data.short_code,
        currency: data.currency || 'USD',
        merchant_name: data.merchant_name || 'the Merchant',
        amount: amount,
        merchantNotes: notes || 'your purchase',
        promo_text: data.promo_text || ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'ZAR') return 'ZAR ';
    if (cur === 'ZIG') return 'ZiG ';
    return '$';
  };

  if (successData) {
     const claimUrl = `${window.location.origin}/bp/${successData.qr_token}`;
     const sym = getCurrencySymbol(successData.currency);
     const promoPart = successData.promo_text ? `\n\nPromotions: ${successData.promo_text}` : '';
     const whatsappText = `Thank you for shopping at ${successData.merchant_name}! Here is your receipt for ${successData.merchantNotes}.\nTotal: ${sym}${successData.amount}\nYour reward: ${sym}${successData.backpay_amount}\n\nClaim it here: ${claimUrl}${promoPart}`;
     const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappText)}`;

      return (
       <main className="min-h-screen p-6 bg-returni-bg flex flex-col items-center pt-12">
         <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
           <div className="w-20 h-20 bg-green-50 text-returni-green rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-sm">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
           </div>
           <h2 className="text-2xl font-black text-returni-dark mb-1 tracking-tight">Sale Recorded</h2>
           <p className="text-returni-green font-bold text-lg mb-4 bg-green-50 py-2 rounded-xl border border-green-100 inline-block px-4">Generated {sym}{successData.backpay_amount} backpay</p>
           
           <div className="bg-white flex justify-center p-6 rounded-3xl mb-4 border-2 border-gray-100 shadow-sm mx-auto max-w-[180px]">
             <QRCodeSVG value={claimUrl} size={140} />
           </div>

           <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Manual Code</p>
             <p className="text-3xl font-mono font-black text-returni-dark tracking-tighter">{successData.short_code}</p>
             <p className="text-[10px] text-gray-400 mt-1 font-bold">EXPIRES IN 7 DAYS</p>
           </div>

           <a 
             href={whatsappLink}
             target="_blank"
             rel="noopener noreferrer"
             className="block w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold mb-4 hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20"
           >
             Send Receipt via WhatsApp
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
            Record a purchase to generate customer backpay (default 0%).
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Currency Selector */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
               {(['USD', 'ZAR', 'ZIG'] as const).map(cur => (
                  <button
                     key={cur}
                     type="button"
                     onClick={() => setCurrency(cur)}
                     className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${currency === cur ? 'bg-white text-returni-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     {cur}
                  </button>
               ))}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-sm font-bold text-returni-dark mb-2">
                Payment Method (Optional)
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green outline-none transition-all font-medium text-returni-dark bg-white appearance-none"
              >
                <option value="CASH">Cash</option>
                <option value="ECOCASH">EcoCash</option>
                <option value="SWIPE">Swipe / Card</option>
              </select>
            </div>

            {/* Merchant Notes (Optional) */}
            <div>
              <label className="block text-sm font-bold text-returni-dark mb-2">
                Internal Notes <span className="text-gray-400 font-normal">(Optional, Private)</span>
              </label>
              <textarea
                value={merchantNotes}
                onChange={(e) => setMerchantNotes(e.target.value)}
                placeholder="e.g. 2x Apples, 1x Milk..."
                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green outline-none transition-all font-medium text-lg resize-y h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-returni-dark mb-2">
                Purchase Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">{getCurrencySymbol(currency)}</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full ${currency === 'ZIG' ? 'pl-16' : currency === 'ZAR' ? 'pl-16' : 'pl-10'} pr-4 py-4 text-2xl rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green font-black text-returni-dark outline-none transition-all`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-returni-dark mb-2">
                Custom Backpay Amount <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">{getCurrencySymbol(currency)}</span>
                <input
                  type="number"
                  step="0.01"
                  value={manualBackpay}
                  onChange={(e) => setManualBackpay(e.target.value)}
                  className={`w-full ${currency === 'ZIG' ? 'pl-16' : currency === 'ZAR' ? 'pl-16' : 'pl-10'} pr-4 py-4 text-2xl rounded-2xl border-2 border-dashed border-gray-200 focus:ring-4 focus:ring-returni-lightGreen focus:border-returni-green font-black text-returni-green outline-none transition-all placeholder:text-gray-200`}
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Leave blank to use your default 0% backpay rate.</p>
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

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <button
                 type="button"
                 onClick={() => setShowUnderDevInfo(true)}
                 className="w-full py-4 rounded-2xl bg-returni-dark text-white font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg shadow-gray-200"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                 Pay using Mobile Money
               </button>

               <button
                 type="submit"
                 disabled={loading}
                 className="w-full py-4 rounded-2xl bg-returni-green text-white font-extrabold text-lg hover:bg-returni-darkGreen disabled:opacity-50 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-green-600/30"
               >
                 {loading ? 'Processing...' : `Record ${currency} Transaction`}
               </button>
            </div>
          </form>
        </div>
      </div>

      <UnderDevelopmentPopup isOpen={showUnderDevInfo} onClose={() => setShowUnderDevInfo(false)} />
    </main>
  );
}
