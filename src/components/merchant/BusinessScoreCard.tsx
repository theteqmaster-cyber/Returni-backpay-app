'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScoreProps {
  stats: any;
  loading: boolean;
}

interface ScoreTier {
  label: string;
  color: string;         // Tailwind text color
  bg: string;            // card bg gradient
  border: string;        // border color
  ring: string;          // SVG ring stroke colour (hex)
  trackRing: string;     // SVG ring track colour (hex)
  message: string;
  advice: string;
}

const TIERS: ScoreTier[] = [
  {
    label: 'Critical',
    color: 'text-red-600',
    bg: 'from-red-50 to-white',
    border: 'border-red-200',
    ring: '#ef4444',
    trackRing: '#fecaca',
    message: '🔴 Your business needs immediate attention.',
    advice: 'Your numbers indicate stress. Let\'s build a recovery plan together.',
  },
  {
    label: 'Low',
    color: 'text-orange-500',
    bg: 'from-orange-50 to-white',
    border: 'border-orange-200',
    ring: '#f97316',
    trackRing: '#fed7aa',
    message: '🟠 Several areas need improvement.',
    advice: 'You have potential. Small tweaks to your BackPay settings can make a big difference.',
  },
  {
    label: 'Fair',
    color: 'text-yellow-600',
    bg: 'from-yellow-50 to-white',
    border: 'border-yellow-200',
    ring: '#ca8a04',
    trackRing: '#fef08a',
    message: '🟡 You\'re making progress — keep going!',
    advice: 'Solid foundation. Focus on getting more customers to redeem their rewards.',
  },
  {
    label: 'Good',
    color: 'text-returni-green',
    bg: 'from-green-50 to-white',
    border: 'border-returni-green/30',
    ring: '#2E7D32',
    trackRing: '#bbf7d0',
    message: '🟢 Your business is performing well.',
    advice: 'Great work! Keep your BackPay active and watch your return rate grow further.',
  },
  {
    label: 'Excellent',
    color: 'text-emerald-600',
    bg: 'from-emerald-50 to-white',
    border: 'border-emerald-300',
    ring: '#059669',
    trackRing: '#6ee7b7',
    message: '💚 Outstanding business health!',
    advice: 'You\'re a RETURNi success story. Ask Vest how to maintain this momentum.',
  },
];

function getTier(score: number): ScoreTier {
  if (score < 30) return TIERS[0];
  if (score < 50) return TIERS[1];
  if (score < 65) return TIERS[2];
  if (score < 82) return TIERS[3];
  return TIERS[4];
}

function calculateScore(stats: any): number {
  let score = 0;

  // 1. Return Rate — 30 pts (most important: do customers come back?)
  const returnRate = parseFloat(stats?.returnRate ?? 0);
  if (returnRate >= 30) score += 30;
  else if (returnRate >= 20) score += 22;
  else if (returnRate >= 10) score += 14;
  else if (returnRate >= 5) score += 7;
  else score += Math.floor((returnRate / 5) * 7);

  // 2. Redemption Rate — 25 pts (are customers actually using their BackPay?)
  const redemptionRate = parseFloat(stats?.redemptionRate ?? 0);
  if (redemptionRate >= 60) score += 25;
  else if (redemptionRate >= 40) score += 18;
  else if (redemptionRate >= 20) score += 11;
  else if (redemptionRate >= 5) score += 5;

  // 3. Sales Activity — 20 pts (based on 6-day daily average)
  const dailySales: { count: number }[] = stats?.dailySales ?? [];
  const avgDaily =
    dailySales.length > 0
      ? dailySales.reduce((sum, d) => sum + (d.count || 0), 0) / dailySales.length
      : 0;
  if (avgDaily >= 10) score += 20;
  else if (avgDaily >= 5) score += 15;
  else if (avgDaily >= 2) score += 10;
  else if (avgDaily >= 1) score += 5;

  // 4. BackPay Configuration — 15 pts (sweet spot is 3–8%)
  const bp = parseFloat(stats?.merchant?.backpay_percent ?? 0);
  if (bp >= 3 && bp <= 8) score += 15;
  else if (bp >= 2 && bp <= 10) score += 10;
  else if (bp > 0) score += 5;
  // 0% = not set up at all = 0pts

  // 5. Liability Health — 10 pts (unclaimed rewards should be manageable)
  const liability = parseFloat(stats?.unclaimedLiability?.USD ?? 0);
  const volume = parseFloat(stats?.totalVol?.USD ?? 0);
  if (volume === 0) {
    score += 5; // no data, neutral
  } else {
    const ratio = liability / volume;
    if (ratio < 0.05) score += 10;
    else if (ratio < 0.15) score += 7;
    else if (ratio < 0.30) score += 3;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

const CACHE_KEY = 'returni_biz_score';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedScore(): { score: number; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function cacheScore(score: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ score, ts: Date.now() }));
  } catch {}
}

// Animated SVG ring gauge
function ScoreRing({ score, tier }: { score: number; tier: ScoreTier }) {
  const [animated, setAnimated] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (animated / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          strokeWidth="10"
          stroke={tier.trackRing}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          strokeWidth="10"
          stroke={tier.ring}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      {/* Score in centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black leading-none ${tier.color}`}>{animated}</span>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function BusinessScoreCard({ stats, loading }: ScoreProps) {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [nextRefresh, setNextRefresh] = useState<string>('');

  useEffect(() => {
    if (loading) return;

    // Try cache first
    const cached = getCachedScore();
    if (cached) {
      setScore(cached.score);
      const remaining = CACHE_TTL_MS - (Date.now() - cached.ts);
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      setNextRefresh(`Refreshes in ${hrs}h ${mins}m`);
      return;
    }

    // Calculate fresh
    const fresh = calculateScore(stats);
    cacheScore(fresh);
    setScore(fresh);
    setNextRefresh('Refreshes in 24h');
  }, [stats, loading]);

  const tier = score !== null ? getTier(score) : TIERS[2];

  const handleAskVest = () => {
    if (score === null) return;
    const params = new URLSearchParams({
      score: String(score),
      tier: tier.label.toLowerCase(),
    });
    router.push(`/merchant/vest?${params.toString()}`);
  };

  return (
    <div className={`bg-gradient-to-br ${tier.bg} rounded-3xl p-6 shadow-xl border ${tier.border} mb-8 relative overflow-hidden`}>
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20"
        style={{ background: tier.ring }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-returni-dark leading-tight">Business Health Score</h2>
          <p className="text-[9px] font-black text-returni-dark/40 uppercase tracking-widest mt-0.5">
            {loading ? 'Calculating...' : nextRefresh}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${tier.color} ${tier.border} bg-white/60`}>
          {loading ? '···' : tier.label}
        </div>
      </div>

      {loading || score === null ? (
        <div className="flex items-center gap-5">
          <div className="w-36 h-36 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-100 animate-pulse rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 animate-pulse rounded-full w-full" />
            <div className="h-3 bg-gray-100 animate-pulse rounded-full w-2/3" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <ScoreRing score={score} tier={tier} />

          <div className="flex-1 min-w-0">
            {/* Status message */}
            <p className="text-sm font-bold text-returni-dark mb-1.5 leading-snug">
              {tier.message}
            </p>
            <p className="text-xs text-returni-dark/60 font-medium leading-relaxed mb-4">
              {tier.advice}
            </p>

            {/* Score breakdown mini */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {[
                { label: 'Return Rate', val: `${stats?.returnRate ?? 0}%` },
                { label: 'Redeem Rate', val: `${stats?.redemptionRate ?? 0}%` },
                { label: 'Avg Daily Sales', val: stats?.dailySales?.length > 0
                    ? `${(stats.dailySales.reduce((s: number, d: any) => s + d.count, 0) / stats.dailySales.length).toFixed(1)} TX`
                    : '0 TX' },
                { label: 'BackPay %', val: `${stats?.merchant?.backpay_percent ?? 0}%` },
              ].map(item => (
                <div key={item.label} className="bg-white/70 rounded-xl px-2.5 py-1.5 border border-white/80">
                  <p className="text-[8px] font-black text-returni-dark/40 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xs font-black text-returni-dark">{item.val}</p>
                </div>
              ))}
            </div>

            {/* Ask Vest button */}
            <button
              onClick={handleAskVest}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-returni-dark text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ask Vest How to Improve My Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
