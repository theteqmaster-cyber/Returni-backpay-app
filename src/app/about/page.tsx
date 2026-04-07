'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const key = e.target.getAttribute('data-reveal');
            if (key) setVisible(prev => ({ ...prev, [key]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const getRevealClass = (key: string) => 
    `transition-all duration-[1000ms] ${visible[key] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`;

  const features = [
    {
      id: 'kyc',
      icon: '🛡️',
      title: 'Foundational KYC',
      desc: 'Trust at the core. Secure, AI-driven identity verification that protects every node in the ecosystem.',
      accent: 'blue'
    },
    {
      id: 'inventory',
      icon: '📸',
      title: 'Inventory Scan',
      desc: 'Stock at speed. Scan physical inventory to instantly sync your digital node with your physical shelf.',
      accent: 'green'
    },
    {
      id: 'wallet',
      icon: '💳',
      title: 'Zero-Gate Wallet',
      desc: 'The Node Economy. Instant, zero-fee value exchange designed specifically for high-velocity merchants.',
      accent: 'blue'
    },
    {
      id: 'audit',
      icon: '📈',
      title: 'Audit & Credit',
      desc: 'Data to Capital. Transform your transaction history into a verified, immutable business credit score.',
      accent: 'green'
    },
    {
      id: 'vest',
      icon: '🧠',
      title: 'Vest AI Manager',
      desc: 'Financial Autonomy. An intelligent, autonomous manager that optimizes cash flow and growth strategies.',
      accent: 'indigo'
    },
    {
      id: 'brickboard',
      icon: '📺',
      title: 'Brickboard Hub',
      desc: 'Visibility First. Broadcast your promotions to the entire local node community via the Discovery Feed.',
      accent: 'blue'
    },
    {
      id: 'backpay',
      icon: '🎁',
      title: 'Backpay Protocol',
      desc: 'Automated Loyalty. Set your rewards once and let the system bring customers back effortlessly.',
      accent: 'green'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-custom"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px] animate-pulse-custom" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {/* NAVBAR (Static Simple) */}
      <nav className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-[100] backdrop-blur-md border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-lg" />
              <span className="font-black italic uppercase tracking-tighter text-xl">Returni</span>
          </Link>
          <div className="flex gap-8 items-center">
              <Link href="/demo-merchant/signup" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Register Hub</Link>
              <Link href="/demo-merchant/login" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">Enter Portal</Link>
          </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center z-10">
          <div className="relative mb-12" data-reveal="hero-logo">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl scale-150 animate-pulse-custom"></div>
              <Image 
                src="/logo.jpg" 
                alt="Returni" 
                width={160} 
                height={160} 
                className="relative rounded-[2.5rem] border-4 border-white/10 shadow-2xl hover:scale-105 transition-transform duration-700"
              />
          </div>
          
          <div className={getRevealClass('hero-text')} data-reveal="hero-text">
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none mb-6">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Resilience</span><br /> Protocol
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                Returni is more than a merchant portal. It is a foundational ecosystem designed to empower local economies through AI-driven loyalty, secure commerce, and smart finance.
              </p>
          </div>
      </section>

      {/* THE FEATURE MATRIX */}
      <section className="relative py-32 px-6 z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                  <div 
                    key={feature.id} 
                    data-reveal={feature.id}
                    className={`group bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col items-start ${getRevealClass(feature.id)}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                      <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500`}>
                          {feature.icon}
                      </div>
                      <h3 className="text-2xl font-black italic tracking-tighter mb-4 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                      <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                          {feature.desc}
                      </p>
                      <div className="mt-auto pt-6 border-t border-white/5 w-full">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-500/50 transition-colors">Protocol v1.02</span>
                      </div>
                  </div>
              ))}

              {/* CALL TO ACTION CARD */}
              <div 
                data-reveal="cta-card"
                className={`lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group shadow-2xl shadow-blue-600/30 ${getRevealClass('cta-card')}`}
              >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 flex-1">
                      <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none mb-6">
                        Build Your Resilience Engine.
                      </h2>
                      <p className="text-blue-100/80 font-bold mb-8 max-w-md">
                        Join thousands of merchants across Africa who are reclaiming their customers and securing their financial future with Returni.
                      </p>
                      <Link 
                        href="/demo-merchant/signup" 
                        className="inline-flex px-12 py-5 bg-white text-blue-600 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95"
                      >
                        Start Your Node
                      </Link>
                  </div>
                  
                  <div className="relative z-10 w-48 h-48 bg-white/5 rounded-[3rem] backdrop-blur-xl border border-white/10 flex items-center justify-center p-8 group-hover:rotate-12 transition-transform duration-700">
                      <Image src="/logo.jpg" alt="CTA Logo" width={100} height={100} className="rounded-2xl" />
                  </div>
              </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-20 px-6 border-t border-white/5 z-10 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-4 mb-8">
              <Image src="/logo.jpg" alt="Footer Logo" width={48} height={48} className="rounded-xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Returni Foundations &copy; 2026</span>
          </Link>
      </footer>

      <style>{`
          @keyframes pulse-custom {
              0%, 100% { opacity: 0.1; }
              50% { opacity: 0.2; }
          }
          .animate-pulse-custom { animation: pulse-custom 4s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
