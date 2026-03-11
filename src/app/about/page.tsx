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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const key = e.target.getAttribute('data-reveal');
            if (key) setVisible(v => ({ ...v, [key]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reveal = (key: string, delay = 0) =>
    `transition-all duration-700 ${visible[key] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`
    + (delay ? ` delay-${delay}` : '');

  return (
    <div className="overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-returni-dark overflow-hidden">
        {/* Animated gradient ring behind logo */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600, height: 600,
            background: 'conic-gradient(from 0deg, #2E7D32, #1565C0, #2E7D32)',
            opacity: 0.12,
            filter: 'blur(60px)',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'spin 12s linear infinite',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(46,125,50,0.15)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center px-6 max-w-3xl" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-returni-green/40 blur-2xl scale-125 animate-pulse" />
              <Image
                src="/logo.jpg"
                alt="RETURNi"
                width={120}
                height={120}
                className="relative rounded-3xl shadow-2xl border-4 border-white/20 object-cover aspect-square"
              />
            </div>
          </div>
          <div className="inline-block bg-returni-green/20 border border-returni-green/40 text-returni-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
            About RETURNi
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Keep Customers<br /><span className="text-returni-green">Coming Back.</span>
          </h1>
          <p className="text-white/60 text-xl leading-relaxed max-w-xl mx-auto">
            A dead-simple loyalty platform built for real African businesses — no tech skills required.
          </p>
        </div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-returni-green/15 pointer-events-none" style={{
            width: 6 + i * 3, height: 6 + i * 3,
            top: `${10 + i * 10}%`, left: `${5 + i * 12}%`,
            animation: `float ${4 + i}s ease-in-out infinite alternate`,
          }} />
        ))}
      </section>

      {/* The Problem */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div data-reveal="problem" className={reveal('problem')}>
            <p className="text-xs font-bold text-returni-green uppercase tracking-widest mb-3 text-center">The problem</p>
            <h2 className="text-4xl font-black text-returni-dark text-center mb-6 leading-tight">
              Your customers <span className="text-red-500 line-through">disappear</span><br /> after their first visit.
            </h2>
            <p className="text-center text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              It costs 5× more to get a new customer than to keep an existing one. But most small businesses have <strong>no system</strong> to bring customers back — just hoping they remember.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: '😔', stat: '68%', label: 'of customers leave because they feel ignored' },
              { icon: '💸', stat: '5×', label: 'more expensive to acquire a new customer' },
              { icon: '📉', stat: '0', label: 'small businesses with a real loyalty system' },
            ].map((item, i) => (
              <div key={i} data-reveal={`problem-card-${i}`} className={`bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 hover:border-returni-green/30 hover:shadow-lg transition-all duration-300 ${reveal(`problem-card-${i}`)}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <p className="text-5xl font-black text-returni-dark mb-2">{item.stat}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 px-6 bg-returni-dark">
        <div className="max-w-5xl mx-auto">
          <div data-reveal="solution" className={`text-center mb-16 ${reveal('solution')}`}>
            <p className="text-xs font-bold text-returni-green uppercase tracking-widest mb-3">The solution</p>
            <h2 className="text-4xl font-black text-white leading-tight">
              RETURNi makes loyalty<br /><span className="text-returni-green">effortless</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: '🛒', title: 'Sale recorded, reward sent instantly', desc: 'When a merchant enters a sale, RETURNi automatically calculates the customer\'s backpay and generates a unique QR code — no extra steps.' },
              { icon: '📱', title: 'No app. No account. Just scan.', desc: 'Customers receive their QR via WhatsApp. They scan it at their next visit to redeem their reward. Dead simple.' },
              { icon: '📊', title: 'Real-time dashboard', desc: 'Merchants see today\'s sales, total volume, backpay liability, and their agent\'s contact — all in one clean screen.' },
              { icon: '🤝', title: 'Agent network', desc: 'Our agents visit merchants, sign them up, and support them on the ground. You\'re never alone.' },
            ].map((item, i) => (
              <div key={i} data-reveal={`sol-${i}`} className={`bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-returni-green/40 transition-all duration-300 group ${reveal(`sol-${i}`)}`}
                style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="font-extrabold text-white text-xl mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-24 px-6 bg-gradient-to-b from-returni-bg to-green-50">
        <div className="max-w-4xl mx-auto">
          <div data-reveal="why" className={`text-center mb-16 ${reveal('why')}`}>
            <p className="text-xs font-bold text-returni-green uppercase tracking-widest mb-3">Why join</p>
            <h2 className="text-4xl font-black text-returni-dark leading-tight">
              What you get for <span className="text-returni-green">$10/month</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: '✅', title: 'Full merchant dashboard', desc: 'Sales tracking, backpay liability, agent support contact, and printable sales reports.' },
              { icon: '✅', title: 'Automated loyalty rewards', desc: 'Every sale automatically generates a customer reward. No manual work.' },
              { icon: '✅', title: 'Dedicated field agent', desc: 'Your own RETURNi agent visits your business, helps onboard, and provides ongoing support.' },
              { icon: '✅', title: 'QR & WhatsApp delivery', desc: 'Rewards go straight to your customers via WhatsApp — they don\'t need to do anything complicated.' },
              { icon: '✅', title: 'No setup fees', desc: 'Just $10/month. Cancel anytime. No contracts.' },
              { icon: '✅', title: 'Secure & private', desc: 'Your business data is secured with industry-standard encryption. 4-hour auto-logout for safety.' },
            ].map((item, i) => (
              <div key={i} data-reveal={`why-${i}`} className={`flex gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-returni-green/20 transition-all duration-300 ${reveal(`why-${i}`)}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-extrabold text-returni-dark mb-1">{item.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us CTA */}
      <section className="py-24 px-6 bg-returni-green">
        <div data-reveal="cta" className={`max-w-2xl mx-auto text-center ${reveal('cta')}`}>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Ready to bring your<br />customers back?
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Get in touch. Our team will reach out, explain everything in person, and get you set up — usually within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/263000000000"
              className="flex items-center justify-center gap-3 bg-white text-returni-green font-black text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-green-900/30"
            >
              <span className="text-2xl">💬</span> Chat on WhatsApp
            </a>
            <a
              href="mailto:hello@returni.app"
              className="flex items-center justify-center gap-3 bg-white/20 border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors"
            >
              <span className="text-2xl">✉️</span> Send an Email
            </a>
          </div>
        </div>
      </section>

      {/* Back home */}
      <div className="py-8 bg-returni-dark text-center">
        <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
          ← Back to Home
        </Link>
      </div>

      <style>{`
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-14px); } }
        @keyframes spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
      `}</style>
    </div>
  );
}
