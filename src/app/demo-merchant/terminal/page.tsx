'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';

export default function TerminalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Checkout State
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showReceipt, setShowReceipt] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('EcoCash');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const id = localStorage.getItem('demo_merchant_id');
    const name = localStorage.getItem('demo_merchant_name');
    if (!id) {
      router.push('/demo-merchant/login');
      return;
    }
    setMerchantId(id);
    setUser({ businessName: name || 'Merchant' });
    fetchData(id);
  }, [router]);

  const fetchData = async (id: string) => {
    try {
      const res = await fetch(`/api/demo/inventory?demoMerchantId=${id}`);
      const data = await res.json();
      if (data.success) setInventory(data.items);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    const existing = cart.find(c => c.id === id);
    if (existing?.quantity === 1) {
      setCart(cart.filter(c => c.id !== id));
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || !merchantId) return;
    
    setIsVerifying(true);
    try {
      const res = await fetch('/api/demo/terminal/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          items: cart,
          paymentMethod,
          currency,
          total: cartTotal
        })
      });

      if (res.ok) {
        // Simulated Verification Delay
        setTimeout(() => {
            setShowReceipt({
                id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
                items: cart,
                total: cartTotal,
                currency,
                method: paymentMethod,
                timestamp: new Date().toLocaleTimeString()
            });
            setShowPaymentGateway(false);
            setCart([]);
            setIsVerifying(false);
            fetchData(merchantId);
        }, 2000);
      } else {
        alert('Transaction failed. Table sync required.');
        setIsVerifying(false);
      }
    } catch (err) {
      alert('Network error');
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 font-sans relative overflow-hidden flex flex-col md:flex-row max-h-screen">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="px-6 py-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl shrink-0">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <Link href="/demo-merchant/dashboard" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-black">
                          &larr;
                      </Link>
                      <div>
                          <h1 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">Terminal V3</h1>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Direct Secure POS</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                       <div className="flex gap-2">
                           {['USD', 'ZiG'].map(curr => (
                               <button 
                                key={curr} 
                                onClick={() => setCurrency(curr)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${currency === curr ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-500'}`}
                               >
                                {curr}
                               </button>
                           ))}
                       </div>
                  </div>
              </div>
          </header>

          {/* Product Grid - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {inventory.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="bg-slate-900/40 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/5 hover:bg-slate-900/60 hover:border-blue-500/30 transition-all text-left group relative overflow-hidden h-32 flex flex-col justify-end"
                      >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-all"></div>
                          <div className="flex-grow flex flex-col justify-center">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 truncate leading-none">{item.name}</p>
                              <p className="text-lg font-black text-white italic tracking-tighter leading-none">${Number(item.price).toFixed(2)}</p>
                          </div>
                          <div className={`mt-2 text-[7px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${item.stock_level < 5 ? 'text-red-400' : 'text-blue-500/50'}`}>
                              <div className={`w-1 h-1 rounded-full ${item.stock_level < 5 ? 'bg-red-400 animate-pulse' : 'bg-blue-500/50'}`}></div>
                              {item.stock_level} Unit
                          </div>
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-[320px] bg-slate-900 border-l border-white/5 flex flex-col h-screen sticky top-0 relative z-20">
          <div className="p-6 border-b border-white/5 shrink-0 flex justify-between items-center">
               <h2 className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic tracking-tighter">Current Slate</h2>
               <button onClick={() => setCart([])} className="text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-red-400 transition-colors">Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide border-b border-white/5">
              {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group animate-slide-up">
                      <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs font-black text-white truncate italic tracking-tight">{item.name}</h4>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{item.quantity} x ${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-black text-[10px]">-</button>
                          <span className="text-xs font-black text-white w-3 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-black text-[10px]">+</button>
                      </div>
                  </div>
              ))}
              {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                       <p className="text-[8px] font-black uppercase tracking-widest">Empty</p>
                  </div>
              )}
          </div>

          {/* Provider Selection */}
          <div className="px-6 py-4 bg-slate-900/50">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">Methods</p>
              <div className="grid grid-cols-2 gap-1.5">
                  {['EcoCash', 'OneMoney', 'Returni', 'Cash'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setPaymentMethod(p)}
                        className={`py-2 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all border ${paymentMethod === p ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white/5 border-white/5 text-slate-500'}`}
                      >
                          {p}
                      </button>
                  ))}
              </div>
          </div>

          <div className="p-6 space-y-4 bg-slate-950 border-t border-white/5">
              <div className="flex justify-between items-end">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Fee Total</span>
                  <span className="text-2xl font-black text-white italic tracking-tighter">
                      {currency === 'USD' ? '$' : ''}{cartTotal.toFixed(2)} {currency === 'ZiG' ? 'ZiG' : ''}
                  </span>
              </div>

              <button 
                onClick={() => setShowPaymentGateway(true)}
                disabled={cart.length === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                  Checkout Client
              </button>
          </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
              <div className="absolute inset-0" onClick={() => setShowPaymentGateway(false)}></div>
              <div className="bg-slate-900 p-8 rounded-[3rem] w-full max-w-xs relative z-10 shadow-[0_0_100px_rgba(59,130,246,0.1)] border border-white/5 text-center animate-slide-up">
                  <div className="mb-6">
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1 font-mono">Secure Gateway V3</p>
                      <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">Settlement for {user?.businessName}</h3>
                  </div>

                  <div className="py-8 bg-white/5 rounded-[2rem] border border-white/5 mb-6 relative group overflow-hidden flex flex-col items-center">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-600/30"></div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Scan Node QR</p>
                      
                      {/* PROPER QR CODE */}
                      <div className="bg-white p-2 rounded-2xl shadow-2xl relative">
                        <QRCodeCanvas 
                          value="https://returni-backpay-app.vercel.app/" 
                          size={140} 
                          level="H"
                          includeMargin={false}
                          className="rounded-lg"
                        />
                        {/* Animated Scan Line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-scanner-line pointer-events-none"></div>
                      </div>

                      <div className="mt-6">
                          <span className="text-2xl font-black text-white italic tracking-tighter">
                            {currency === 'USD' ? '$' : ''}{cartTotal.toFixed(2)}
                          </span>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowPaymentGateway(false)}
                        className="flex-1 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={handleCheckout}
                        disabled={isVerifying}
                        className="flex-[2] py-4 bg-white text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                      >
                        {isVerifying ? 'Verifying...' : `Confirm ${paymentMethod}`}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Success Receipt Modal */}
      {showReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
              <div className="absolute inset-0" onClick={() => setShowReceipt(null)}></div>
              <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-[320px] relative z-10 shadow-3xl text-slate-950 text-center animate-receipt-unfold border border-slate-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-black italic tracking-tighter leading-none mb-1">Sale Verified</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-6">{showReceipt.id}</p>
                  
                  <div className="w-full space-y-2 mb-6 text-left border-y border-dashed border-slate-200 py-4">
                      {showReceipt.items.map((item: any) => (
                           <div key={item.id} className="flex justify-between text-[10px] font-bold">
                               <span className="text-slate-500 uppercase tracking-tight">{item.quantity} x {item.name}</span>
                               <span>${(item.price * item.quantity).toFixed(2)}</span>
                           </div>
                      ))}
                      <div className="pt-2 flex justify-between font-black text-base italic tracking-tight">
                          <span>Total Paid</span>
                          <span>{showReceipt.currency === 'USD' ? '$' : ''}{showReceipt.total.toFixed(2)}</span>
                      </div>
                  </div>

                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 underline decoration-blue-500 decoration-2 underline-offset-4">Verified by Returni Protocol</p>

                  {/* RECEIPT QR CODE */}
                  <div className="bg-slate-50 p-4 rounded-3xl inline-block mb-6 border border-slate-100">
                      <QRCodeCanvas 
                        value="https://returni-backpay-app.vercel.app/" 
                        size={120} 
                        level="M"
                        className="rounded-lg"
                      />
                      <p className="text-[7px] font-black uppercase text-slate-400 mt-2 tracking-widest italic">Digital Receipt Token</p>
                  </div>

                  <button 
                    onClick={() => setShowReceipt(null)}
                    className="w-full py-4 bg-slate-950 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                  >
                      Complete & Clear
                  </button>
              </div>
          </div>
      )}

      <style jsx>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes receipt-unfold {
            from { transform: scaleY(0); transform-origin: top; opacity: 0; }
            to { transform: scaleY(1); transform-origin: top; opacity: 1; }
        }
        .animate-receipt-unfold { animation: receipt-unfold 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes scanner-line {
            0% { top: 0%; }
            100% { top: 100%; }
        }
        .animate-scanner-line { animation: scanner-line 2s linear infinite; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
