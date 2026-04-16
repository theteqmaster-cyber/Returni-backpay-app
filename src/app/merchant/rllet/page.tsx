'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UnderDevelopmentPopup from '@/components/merchant/UnderDevelopmentPopup';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  date: string;
  desc: string;
  status: 'completed' | 'pending';
}

export default function RlletDashboard() {
  const [balance, setBalance] = useState<string>('...');
  const [currency, setCurrency] = useState('USD');
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Transfer form state
  const [channel, setChannel] = useState('EcoCash');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  
  // Security PIN state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  
  // Processing state
  const [transferring, setTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<{ err?: string; success?: string } | null>(null);

  // Popup state
  const [showUnderDevInfo, setShowUnderDevInfo] = useState(false);

  // Mock history
  const [history, setHistory] = useState<Transaction[]>([
    { id: 'T101', type: 'incoming', amount: 350.00, date: new Date().toISOString(), desc: 'Top Up - Internal Wallet', status: 'completed' },
    { id: 'T100', type: 'outgoing', amount: 10.00, date: new Date(Date.now() - 86400000).toISOString(), desc: 'RETURNi Platform Fee', status: 'completed' }
  ]);

  const fetchBalance = () => {
    setLoadingBalance(true);
    fetch('/api/wallet/balance')
      .then(res => res.json())
      .then(data => {
        if (data.amount) {
          setBalance(data.amount);
          setCurrency(data.currency || 'USD');
        }
      })
      .finally(() => setLoadingBalance(false));
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleOpenTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !amount) return;
    setTransferStatus(null);
    setShowPinModal(true);
    setPin('');
  };

  const handleFinalizeTransfer = async () => {
    if (pin.length < 4) {
      setTransferStatus({ err: 'PIN must be at least 4 digits.' });
      return;
    }
    
    setShowPinModal(false);
    setTransferring(true);
    setTransferStatus(null);

    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, mobile, amount, pin })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTransferStatus({ success: data.message });
        setMobile('');
        setAmount('');
        // Local deduction
        setBalance(prev => (parseFloat(prev) - parseFloat(amount)).toFixed(2));
        setHistory(prev => [{
          id: data.transactionId,
          type: 'outgoing',
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          desc: `${channel} Transfer: ${mobile}`,
          status: 'completed'
        }, ...prev]);
      } else {
        setTransferStatus({ err: data.error || 'Transfer failed.' });
      }
    } catch (err: any) {
      setTransferStatus({ err: err.message || 'Network error.' });
    } finally {
      setTransferring(false);
    }
  };

  const handleAddFunds = () => setShowUnderDevInfo(true);
  const handleWithdraw = () => setShowUnderDevInfo(true);
  const handlePlatformFee = () => setShowUnderDevInfo(true);

  return (
    <div className="min-h-screen bg-returni-bg flex flex-col max-w-2xl mx-auto xl:max-w-3xl relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-returni-bg border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <Link
          href="/merchant/dashboard"
          className="text-returni-dark/60 font-medium text-sm hover:text-returni-dark transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-xs font-black uppercase tracking-widest text-[#2fbb5e] bg-green-50 px-3 py-1 rounded-full border border-green-200">
          Experimental
        </span>
      </div>

      <div className="px-5 py-6">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#152e1f] rounded-3xl p-8 shadow-xl text-white mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-[#2fbb5e]/20 blur-3xl translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" />
          <h1 className="text-[#2fbb5e] font-black uppercase tracking-widest text-xs mb-1">Total Available Balance</h1>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-2xl font-bold text-white/50">{currency}</span>
            <span className="text-5xl font-black tracking-tight">{loadingBalance ? '...' : balance}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleAddFunds} className="flex-1 bg-[#2fbb5e] hover:bg-green-500 transition-colors text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl">
              Add Funds
            </button>
            <button onClick={handleWithdraw} className="flex-1 bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl border border-white/10">
              Withdraw
            </button>
          </div>
        </div>

        {/* Transfer Action */}
        <h2 className="font-black text-returni-dark text-lg mb-4">Send Funds / Payout</h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-returni-green/20 mb-8 relative overflow-hidden">
           {transferring && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-4 border-[#2fbb5e] border-t-transparent animate-spin mb-2" />
                    <span className="text-xs font-bold text-returni-dark uppercase tracking-widest">Processing</span>
                 </div>
              </div>
           )}

          <form className="space-y-4" onSubmit={handleOpenTransfer}>
             <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-returni-dark/40 mb-1.5">Transfer Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2fbb5e] focus:bg-white transition-all text-returni-dark font-medium appearance-none"
              >
                <option value="EcoCash">EcoCash</option>
                <option value="Innbucks">Innbucks</option>
                <option value="Mastercard">Mastercard</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-returni-dark/40 mb-1.5">Destination (Account/Mobile)</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="e.g. 0771234567"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2fbb5e] focus:bg-white transition-all text-returni-dark font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-returni-dark/40 mb-1.5">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2fbb5e] focus:bg-white transition-all text-returni-dark font-medium"
              />
            </div>

            {transferStatus?.err && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{transferStatus.err}</p>
            )}
            {transferStatus?.success && (
              <p className="text-xs font-bold text-[#2fbb5e] bg-green-50 p-3 rounded-xl border border-green-100">{transferStatus.success}</p>
            )}

            <button
              disabled={transferring || !mobile || !amount}
              type="submit"
              className="w-full bg-[#2fbb5e] hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-[#2fbb5e] text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-green-900/10 mt-2"
            >
              Verify & Send
            </button>
          </form>
        </div>

        {/* Pay Platform Fee */}
        <h2 className="font-black text-returni-dark text-lg mb-4">Account Billing</h2>
        <div 
           onClick={handlePlatformFee}
           className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 cursor-pointer hover:border-returni-blue hover:shadow-md transition-all group flex items-center justify-between"
        >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-returni-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                 <h3 className="font-bold text-returni-dark text-md">Pay Platform Fee</h3>
                 <p className="text-gray-500 text-xs font-medium mt-0.5">Settle your monthly RETURNi subscription instantly via Rllet.</p>
              </div>
           </div>
           <svg className="w-5 h-5 text-gray-300 group-hover:text-returni-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </div>

        {/* Mock History */}
        <h2 className="font-black text-returni-dark text-lg mb-4">Recent Activity</h2>
        <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 mb-12">
          {history.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map(tx => (
                <div key={tx.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'incoming' ? 'bg-green-100 text-[#2fbb5e]' : 'bg-gray-100 text-gray-500'}`}>
                       {tx.type === 'incoming' ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                       )}
                    </div>
                    <div>
                      <p className="font-bold text-returni-dark text-sm">{tx.desc}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                        {new Date(tx.date).toLocaleDateString()} · {tx.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${tx.type === 'incoming' ? 'text-[#2fbb5e]' : 'text-returni-dark'}`}>
                      {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security PIN Modal */}
      {showPinModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-returni-dark/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
               <button onClick={() => setShowPinModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               
               <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-returni-blue border border-blue-100">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 className="font-extrabold text-lg text-returni-dark">Security PIN Required</h3>
                  <p className="text-sm text-gray-500 mt-1">Please enter your 4-digit Rllet PIN to authorize this transfer.</p>
               </div>

               <div className="space-y-4">
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    className="w-full text-center tracking-[0.5em] text-2xl px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-returni-blue focus:bg-white transition-all text-returni-dark font-black"
                    autoFocus
                  />
                  <button
                    onClick={handleFinalizeTransfer}
                    disabled={pin.length < 4}
                    className="w-full bg-returni-dark text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-black transition-colors"
                  >
                    Confirm Transfer
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Experimental Under Development Prompt */}
      <UnderDevelopmentPopup isOpen={showUnderDevInfo} onClose={() => setShowUnderDevInfo(false)} />

    </div>
  );
}
