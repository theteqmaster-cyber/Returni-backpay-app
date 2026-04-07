'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VestAIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const merchantId = localStorage.getItem('demo_merchant_id');
    const name = localStorage.getItem('demo_merchant_name');
    
    if (!merchantId) {
      router.push('/demo-merchant/login');
      return;
    }

    setLoading(true);
    setUser({ id: merchantId, businessName: name || 'Merchant' });

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/demo/vest-ai?merchantId=${merchantId}`);
        const data = await res.json();
        setAnalytics(data);
        
        // Initial AI Greeting
        setChatMessages([{ 
            sender: 'ai', 
            text: `Hi ${name || 'Merchant'}, I've synchronized your ledger. Your Credit Score is ${data.score} (${data.level}). Business is looking stable. How can I assist you with your financial planning today?` 
        }]);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const userMsg = currentInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setCurrentInput('');
    setIsTyping(true);

    // Simulated AI Processing
    setTimeout(() => {
       let aiResponse = "I'm analyzing that through the sandbox protocol. For now, your treasury remains healthy.";
       
       if (userMsg.toLowerCase().includes('hi')) {
           aiResponse = "Hi! Business is doing well for now. Your current data suggests positive growth trajectories.";
       } else if (userMsg.toLowerCase().includes('score') || userMsg.toLowerCase().includes('credit')) {
           aiResponse = `Your Credit Score is ${analytics?.score}. This puts you in the ${analytics?.level} tier for business eligibility.`;
       } else if (userMsg.toLowerCase().includes('help')) {
           aiResponse = "I can help you analyze your supplier expenses, liquidity reserves, or credit eligibility. What would you like to know?";
       }

       setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
       setIsTyping(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 font-sans relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -ml-32 -mb-32"></div>

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 sticky top-0 z-40 shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/demo-merchant/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-black">
                &larr;
            </Link>
            <div>
              <h1 className="text-lg font-black text-white italic tracking-tight leading-none uppercase">Vest AI Advisor</h1>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Direct Secure Line</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Secured Protocol</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto overflow-hidden flex flex-col relative z-10">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide"
          >
              {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                      <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[2.5rem] text-sm font-bold leading-relaxed border shadow-2xl ${
                          msg.sender === 'user' 
                          ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' 
                          : 'bg-slate-900/40 border-white/5 text-slate-300 rounded-tl-none backdrop-blur-xl'
                      }`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isTyping && (
                  <div className="flex justify-start">
                      <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] rounded-tl-none backdrop-blur-xl flex gap-1 transform transition-all animate-pulse">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                  </div>
              )}
          </div>

          {/* Persistent Focus Input */}
          <div className="p-6 md:p-10 shrink-0">
              <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                  <input 
                      type="text"
                      autoFocus
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Ask Vest AI about your Credit Score or Treasury..."
                      className="relative w-full bg-slate-900 border border-white/10 rounded-[2.5rem] px-10 py-6 text-base font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 shadow-2xl"
                  />
                  <button 
                      type="submit"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white text-slate-950 rounded-[1.5rem] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl"
                  >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
              </form>
              <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-6">Vest AI V3 // Secured Focus Mode</p>
          </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
