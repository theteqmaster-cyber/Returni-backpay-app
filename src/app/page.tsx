'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// ── Language definitions ──────────────────────────────────────────────────────
type Lang = 'en' | 'sn' | 'nd';

interface LangStrings {
  label: string;        // display name
  flag: string;         // emoji flag
  updateTitle: string;
  updateBody: string;
  updateSigned: string;
  tagline: string;
  btnMerchant: string;
  btnTrader: string;
  btnScan: string;
  btnLearn: string;
  scroll: string;
  howLabel: string;
  howTitle: string;
  features: { icon: string; title: string; desc: string }[];
  stats: { value: string; label: string }[];
}

const TRANSLATIONS: Record<Lang, LangStrings> = {
  en: {
    label: 'English',
    flag: '🇬🇧',
    updateTitle: 'Platform Updates Underway',
    updateBody: "We're rolling out some improvements. You may notice minor changes to the interface — everything is working as expected.",
    updateSigned: 'Thank you for your patience — RETURNi Team',
    tagline: 'The simple customer retention platform\nfor local businesses.',
    btnMerchant: 'Merchant Login',
    btnTrader: 'Trader Portal (Multi-Branch)',
    btnScan: 'Redeem QR Code',
    btnLearn: 'Learn about RETURNi →',
    scroll: 'Scroll',
    howLabel: 'How it works',
    howTitle: 'Built for real businesses',
    features: [
      { icon: '🛒', title: 'Record Sales', desc: 'Merchant logs a sale. Customer gets a QR code with their backpay amount instantly.' },
      { icon: '📱', title: 'Customer Redeems', desc: 'Customer scans their QR at their next visit. No app download. No account needed.' },
      { icon: '📊', title: 'You Grow', desc: 'Track which customers return, how much they spend, and your loyalty liability in real-time.' },
    ],
    stats: [
      { value: '4hrs', label: 'Session timeout for security' },
      { value: '$10', label: 'Flat monthly fee for merchants' },
      { value: '2-5%', label: 'Configurable backpay per sale' },
    ],
  },

  sn: {
    label: 'Shona',
    flag: '🇿🇼',
    updateTitle: 'Shanduko Iri Kuitwa',
    updateBody: 'Tiri kuita shanduko diki. Unogona kuona kuchinjiwa kwemamwe mativi — zvose zviri kushanda zvakanaka.',
    updateSigned: 'Tinotenda mwoyo wako murefu — Vashandi veRETURNi',
    tagline: 'Nzira nyore yekuchengetedza\nvatengi vako vemuchitown.',
    btnMerchant: 'Pinda seMutengesi',
    btnTrader: 'Portali yeVatengesi Vakawanda',
    btnScan: 'Shandura Kodhi yeQR',
    btnLearn: 'Dzidza nezveRETURNi →',
    scroll: 'Skora Pasi',
    howLabel: 'Zvinoitwa sei',
    howTitle: 'Yakavakiwa mabhizinesi echokwadi',
    features: [
      { icon: '🛒', title: 'Nyora Kutenga', desc: 'Mutengesi anorekodha kutenga. Mutengi anogamuchira kodhi yeQR ine mari yake pakarepo.' },
      { icon: '📱', title: 'Mutengi Anoshandura', desc: 'Mutengi ano-scan kodhi yeQR kana achidzoka. Hapana app. Hapana account inodikanwa.' },
      { icon: '📊', title: 'Unokura', desc: 'Tarisa vatengi vanodzioka, vanowanika marii, uye chikwereti chako wekuvadzidzisa nguva dzose.' },
    ],
    stats: [
      { value: '4hrs', label: 'Nguva ye-session yekuchengetedza' },
      { value: '$10', label: 'Muripo wemwedzi wemutengesi' },
      { value: '2-5%', label: 'BackPay inogona kugadziriswa' },
    ],
  },

  nd: {
    label: 'Ndebele',
    flag: '🇿🇼',
    updateTitle: 'Izinguquko Ziyenziwa',
    updateBody: 'Siyenza izinguquko ezincane. Ungabona umehluko omncane—konke kusebenza kahle.',
    updateSigned: 'Siyabonga ngesineke sakho — Ithimba leRETURNi',
    tagline: 'Indlela elula yokugcina\nabathengi bamabhizinesi endawo.',
    btnMerchant: 'Ngena njengoMthengisi',
    btnTrader: 'Isango labaDayisi (Amagatsha Amanengi)',
    btnScan: 'Sebenzisa ikhodi ye-QR',
    btnLearn: 'Funda ngeRETURNi →',
    scroll: 'Skrola Phansi',
    howLabel: 'Isebenza kanjani',
    howTitle: 'Yakhiwe amabhizinesi akhona',
    features: [
      { icon: '🛒', title: 'Rekhoda Ukuthengisa', desc: 'UMthengisi ubhala ukuthengwa. UMthengi uthola ikhodi ye-QR enenani lakhe ngokushesha.' },
      { icon: '📱', title: 'UMthengi Uyashandura', desc: 'UMthengi u-scan ikhodi ye-QR nxa ebuyela. Akulawo ukulanda uhlelo. Akudingi i-akhawunti.' },
      { icon: '📊', title: 'Uyakhula', desc: 'Beka iso kubathengi ababuyayo, imali yabo, lobudisi be-loyalty bakho ngokungenisa ngensimu.' },
    ],
    stats: [
      { value: '4hrs', label: 'Isikhathi se-session sokuphepha' },
      { value: '$10', label: 'Intengo yenyanga yomthengisi' },
      { value: '2-5%', label: 'I-BackPay engasetshenzwa ngendlela' },
    ],
  },
};

const LANG_ORDER: Lang[] = ['en', 'sn', 'nd'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState({ features: false, stats: false });
  const [lang, setLang] = useState<Lang>('en');

  const t = TRANSLATIONS[lang];

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

      {/* ── Language Switcher ── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md border border-returni-green/20 rounded-2xl shadow-md shadow-green-900/5">
        {LANG_ORDER.map(l => {
          const opt = TRANSLATIONS[l];
          const active = lang === l;
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              title={opt.label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                active
                  ? 'bg-returni-green text-white shadow-sm'
                  : 'text-returni-dark/50 hover:text-returni-green hover:bg-green-50'
              }`}
            >
              <span className="text-base leading-none">{opt.flag}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>

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

          {/* Language badge — shows current language when not English */}
          {lang !== 'en' && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-returni-green/10 border border-returni-green/25 rounded-full">
              <span className="text-sm">{t.flag}</span>
              <span className="text-[10px] font-black text-returni-green uppercase tracking-widest">
                {t.label} · Experimental
              </span>
              <div className="w-1 h-1 bg-returni-green rounded-full animate-pulse" />
            </div>
          )}

          {/* Platform Update Notice */}
          <div className="mb-8 relative">
            <div className="relative inline-flex w-full items-start gap-3 px-5 py-4 bg-white/70 backdrop-blur-sm border border-returni-green/30 rounded-2xl shadow-sm shadow-green-900/5 text-left">
              <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-returni-green rounded-full" />
              <div className="mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-returni-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="pl-1">
                <p className="text-[11px] font-black text-returni-dark uppercase tracking-widest mb-1 transition-all duration-300">
                  {t.updateTitle}
                </p>
                <p className="text-[11px] text-returni-dark/60 font-medium leading-relaxed transition-all duration-300">
                  {t.updateBody}
                </p>
                <p className="text-[9px] font-black text-returni-green uppercase tracking-widest mt-2 transition-all duration-300">
                  {t.updateSigned}
                </p>
              </div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-returni-green rounded-full animate-ping opacity-60" />
            </div>
          </div>

          <h1 className="text-5xl font-black text-returni-dark mb-4 tracking-tight">
            RETURN<span className="text-returni-green">i</span>
          </h1>
          <p className="text-returni-dark/70 mb-10 text-xl font-medium leading-relaxed whitespace-pre-line transition-all duration-300">
            {t.tagline}
          </p>

          <div className="space-y-4">
            <Link
              href="/merchant/login"
              className="block w-full py-4 px-6 rounded-2xl bg-returni-green text-white font-bold text-lg shadow-lg shadow-green-600/30 hover:bg-returni-darkGreen transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-green-600/40"
            >
              {t.btnMerchant}
            </Link>
            <Link
              href="/trader/login"
              className="block w-full py-4 px-6 rounded-2xl bg-returni-dark text-white font-bold text-lg shadow-lg hover:bg-black transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
              {t.btnTrader}
            </Link>
            <Link
              href="/scan"
              className="block w-full py-4 px-6 rounded-2xl border-2 border-returni-dark text-returni-dark font-bold text-center hover:bg-gray-100 transition-all transform hover:-translate-y-0.5"
            >
              {t.btnScan}
            </Link>
            <Link
              href="/about"
              className="block w-full py-3 text-returni-green font-semibold text-center hover:text-returni-darkGreen transition-colors text-sm"
            >
              {t.btnLearn}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center gap-3 text-returni-dark/30 pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] translate-x-[0.2em]">{t.scroll}</span>
          <div className="w-px h-12 bg-gradient-to-b from-returni-green to-transparent animate-bounce" />
        </div>
      </section>

      {/* Feature Cards — scroll reveal */}
      <section
        data-section="features"
        className={`py-20 px-6 transition-all duration-700 ${visible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-returni-green uppercase tracking-widest mb-3 transition-all duration-300">
            {t.howLabel}
          </p>
          <h2 className="text-3xl font-black text-returni-dark text-center mb-12 tracking-tight transition-all duration-300">
            {t.howTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.features.map((f, i) => (
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
          {t.stats.map((s, i) => (
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
