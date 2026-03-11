'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState({ features: false, stats: false });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setVisible(v => ({ ...v, [e.target.getAttribute('data-section') || '']: true }));
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-returni-bg via-green-50/30 to-returni-bg">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      >
        {/* Animated background orbs */}
        <div
          className="absolute w-96 h-96 rounded-full bg-returni-green/10 blur-3xl pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px) translate(-50%, -50%)`, top: '30%', left: '60%' }}
        />
        <div
          className="absolute w-64 h-64 rounded-full bg-returni-blue/10 blur-3xl pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px) translate(-50%, -50%)`, top: '60%', left: '30%' }}
        />

        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-returni-green/20 pointer-events-none"
            style={{
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              top: `${15 + i * 12}%`,
              left: `${10 + i * 14}%`,
              transform: `translate(${mousePos.x * (0.3 + i * 0.1)}px, ${mousePos.y * (0.3 + i * 0.1)}px)`,
              transition: `transform ${0.4 + i * 0.1}s ease-out`,
              animation: `float ${3 + i}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        {/* Logo with parallax */}
        <div
          className="relative z-10 text-center max-w-md w-full"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-returni-green/30 blur-xl scale-110 animate-pulse" />
              <Image
                src="/logo.jpg"
                alt="RETURNi Logo"
                width={160}
                height={160}
                className="relative rounded-3xl shadow-2xl border-4 border-white object-cover aspect-square hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>

          <h1 className="text-5xl font-black text-returni-dark mb-4 tracking-tight">
            RETURN<span className="text-returni-green">i</span>
          </h1>
          <p className="text-returni-dark/70 mb-10 text-xl font-medium leading-relaxed">
            The simple customer retention platform<br />for local businesses.
          </p>

          <div className="space-y-4">
            <Link
              href="/merchant/login"
              className="block w-full py-4 px-6 rounded-2xl bg-returni-green text-white font-bold text-lg shadow-lg shadow-green-600/30 hover:bg-returni-darkGreen transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-green-600/40"
            >
              Merchant Login
            </Link>
            <Link
              href="/scan"
              className="block w-full py-4 px-6 rounded-2xl border-2 border-returni-dark text-returni-dark font-bold text-center hover:bg-returni-dark hover:text-white transition-all transform hover:-translate-y-0.5"
            >
              Redeem QR Code
            </Link>
            <Link
              href="/about"
              className="block w-full py-3 text-returni-green font-semibold text-center hover:text-returni-darkGreen transition-colors text-sm"
            >
              Learn about RETURNi →
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-returni-dark/40 animate-bounce">
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Feature Cards — scroll reveal */}
      <section
        data-section="features"
        className={`py-20 px-6 transition-all duration-700 ${visible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-returni-green uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-black text-returni-dark text-center mb-12 tracking-tight">Built for real businesses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🛒', title: 'Record Sales', desc: 'Merchant logs a sale. Customer gets a QR code with their backpay amount instantly.' },
              { icon: '📱', title: 'Customer Redeems', desc: 'Customer scans their QR at their next visit. No app download. No account needed.' },
              { icon: '📊', title: 'You Grow', desc: 'Track which customers return, how much they spend, and your loyalty liability in real-time.' },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="font-extrabold text-returni-dark text-xl mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip — scroll reveal */}
      <section
        data-section="stats"
        className={`py-16 px-6 bg-returni-dark transition-all duration-700 ${visible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center text-white">
          {[
            { value: '4hrs', label: 'Session timeout for security' },
            { value: '$10', label: 'Flat monthly fee for merchants' },
            { value: '2-5%', label: 'Configurable backpay per sale' },
          ].map((s, i) => (
            <div key={i} className="group">
              <p className="text-4xl font-black text-returni-green group-hover:scale-110 transition-transform duration-300">{s.value}</p>
              <p className="text-white/50 text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-12px); }
        }
      `}</style>
    </main>
  );
}
