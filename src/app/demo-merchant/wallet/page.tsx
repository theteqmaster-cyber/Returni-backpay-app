'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';

export default function DemoMerchantWalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState<any>(null); // 'payment' | 'receive' | 'withdrawal'
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState('Returni Wallet');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('Supplier');
  const [description, setDescription] = useState('');
  const [receiveStep, setReceiveStep] = useState(1); // 1: select, 2: generating, 3: qr

  const fetchWalletData = async () => {
    const merchantId = localStorage.getItem('demo_merchant_id');
    if (!merchantId) {
      router.push('/demo-merchant/login');
      return;
    }

    try {
      const res = await fetch(`/api/demo/wallet?merchantId=${merchantId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Fetch wallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [router]);

  const handleAction = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    const merchantId = localStorage.getItem('demo_merchant_id');
    if (!merchantId) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/demo/wallet/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          type: showActionModal,
          amount,
          currency,
          provider,
          description,
          phoneNumber,
          category
        })
      });

      if (res.ok) {
        setAmount('');
        setPhoneNumber('');
        setDescription('');
        setShowActionModal(null);
        setReceiveStep(1);
        await fetchWalletData();
      } else {
        const err = await res.json();
        alert(err.error || 'Action failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const startReceiveWorkflow = () => {
    setReceiveStep(2);
    setTimeout(() => {
      setReceiveStep(3);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 font-sans pb-20 relative overflow-hidden text-white">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Link href="/demo-merchant/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                &larr;
              </Link>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none italic uppercase">Returni Wallet</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Bank Integrated</p>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sandbox Active</span>
           </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Balances Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-returni-green/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total USD Liquid</p>
               <h2 className="text-5xl font-black tracking-tighter truncate">${data?.balances?.USD || '0.00'}</h2>
               <div className="mt-8 flex gap-3">
                  <button onClick={() => { setShowActionModal('payment'); setProvider('Returni Wallet'); }} className="px-6 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-xl">Pay Supplier</button>
                  <button onClick={() => { setShowActionModal('receive'); setReceiveStep(1); }} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20">Receive Money</button>
               </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total ZiG Reserve</p>
               <h2 className="text-5xl font-black tracking-tighter truncate">{data?.balances?.ZiG || '0'} <span className="text-lg text-blue-400 italic">ZiG</span></h2>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center text-center md:text-left">
                <h3 className="text-lg font-black italic tracking-tight">Verified Treasury Ledger</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Synchronized</span>
            </div>
            <div className="p-4 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                            <th className="px-6 py-4">Gateway</th>
                            <th className="px-6 py-4">Context</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Volume</th>
                            <th className="px-6 py-4">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data?.transactions?.map((tx: any) => (
                            <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-6 py-6">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{tx.provider}</p>
                                    <p className="text-[9px] text-slate-500 font-bold tracking-tighter">{tx.phone_number || 'Internal Node'}</p>
                                </td>
                                <td className="px-6 py-6">
                                    <p className="font-black text-sm uppercase italic tracking-tight">{tx.type === 'payment' ? 'Settlement' : 'Deposit'}</p>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{tx.description}</p>
                                </td>
                                <td className="px-6 py-6">
                                   <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black ${tx.category === 'Supplier' ? 'bg-orange-500/10 text-orange-400' : tx.category === 'Client' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                     {tx.category || 'Standard'}
                                   </span>
                                </td>
                                <td className="px-6 py-6 font-black text-sm">
                                    <span className={tx.type === 'receive' ? 'text-green-400' : 'text-white'}>
                                        {tx.type === 'receive' ? '+' : '-'}{tx.currency === 'USD' ? '$' : ''}{tx.amount} {tx.currency === 'ZiG' ? 'ZiG' : ''}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {new Date(tx.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {(!data?.transactions || data.transactions.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-[10px] uppercase tracking-[0.5em] text-slate-700 font-black">
                                    Ledger is currently empty
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Pay Supplier Modal */}
      {showActionModal === 'payment' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowActionModal(null)}></div>
            <div className="bg-white p-8 rounded-[3rem] w-full max-w-md relative z-10 shadow-2xl border border-white/5 animate-slide-up text-slate-950 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter italic">Pay Supplier</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Authorized Bank Protocol</p>
                    </div>
                </div>
                
                <form onSubmit={handleAction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Currency</label>
                            <select 
                                value={currency} 
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-600 transition-colors"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="ZiG">ZiG</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount</label>
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-600 transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Gateway Provider</label>
                        <select 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-600 transition-colors"
                        >
                            <option value="Returni Wallet">Returni Wallet (Direct)</option>
                            <option value="EcoCash">EcoCash</option>
                            <option value="OneMoney">OneMoney</option>
                            <option value="Omari">Omari</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier Phone / Account</label>
                        <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-600 transition-colors"
                            placeholder="e.g. 0771234567"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-600 transition-colors"
                        >
                            <option value="Supplier">Supplier / Inventory</option>
                            <option value="Client">Client Refund / Service</option>
                            <option value="Personal">Personal / Salary</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Reference</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:border-blue-600 transition-colors h-20 resize-none"
                            placeholder="e.g. HDMI codes bulk purchase"
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={() => setShowActionModal(null)} className="flex-1 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest hover:text-slate-600">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={actionLoading}
                            className="flex-1 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                        >
                            {actionLoading ? 'Verifying...' : 'Authorize Pay'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {/* Receive Money Modal */}
      {showActionModal === 'receive' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowActionModal(null)}></div>
            <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm relative z-10 shadow-2xl border border-white/5 animate-slide-up text-slate-950 text-center">
                
                {receiveStep === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black tracking-tighter italic">Receive Funds</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Select Payment Method</p>
                        <div className="grid grid-cols-1 gap-3">
                            {['EcoCash', 'OneMoney', 'ZimSwitch', 'Returni Pay'].map(p => (
                                <button 
                                    key={p}
                                    onClick={() => { setProvider(p); startReceiveWorkflow(); }}
                                    className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-200 font-black text-sm hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-[0.98]"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {receiveStep === 2 && (
                    <div className="py-12 space-y-6 flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-sm uppercase tracking-widest animate-pulse">Generating Secure Invoice...</p>
                    </div>
                )}

                {receiveStep === 3 && (
                    <div className="space-y-8 flex flex-col items-center">
                        <div>
                            <h3 className="text-2xl font-black tracking-tighter italic mb-1">Scan to Pay</h3>
                            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{provider} Gateway Active</p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-600/10 border-4 border-slate-50 relative group">
                            <QRCodeCanvas 
                                value={`https://returni-backpay-app.vercel.app/pay?merchantId=${localStorage.getItem('demo_merchant_id')}&amount=${amount}`}
                                size={180}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: "/favicon.ico",
                                    x: undefined,
                                    y: undefined,
                                    height: 24,
                                    width: 24,
                                    excavate: true,
                                }}
                            />
                            <div className="absolute inset-0 border-2 border-blue-500/20 m-4 rounded-3xl pointer-events-none group-hover:border-blue-500/40 transition-colors"></div>
                        </div>

                        <div className="w-full space-y-3">
                            <button 
                                onClick={handleAction}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                {actionLoading ? 'Confirming...' : 'Verify Receipt'}
                            </button>
                            <button 
                                onClick={() => setShowActionModal(null)}
                                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]"
                            >
                                Abort Transaction
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </main>
  );
}
