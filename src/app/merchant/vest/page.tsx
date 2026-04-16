'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getVestResponse, ChatMessage } from '@/lib/vest';

interface UIMessage {
  id: string;
  role: 'user' | 'vest';
  text: string;
  loading?: boolean;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What does my return rate actually mean?",
  "Am I issuing too much backpay?",
  "How can I get more customers to come back?",
  "What is my unclaimed liability?",
  "Is my redemption rate good or bad?",
];

const COOLDOWN_SECONDS = 60;

function VestChat() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get('score');   // e.g. "72"
  const tierParam = searchParams.get('tier');     // e.g. "good"
  const hasScoreContext = !!scoreParam;

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [merchantName, setMerchantName] = useState('');
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown ticker
  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  // Load merchant stats
  useEffect(() => {
    const merchantId = localStorage.getItem('returni_merchant_id');
    const name = localStorage.getItem('returni_user_name') || '';
    setMerchantName(name);
    if (!merchantId) return;
    fetch(`/api/stats?merchantId=${merchantId}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setStats(data); })
      .catch(() => {});
  }, []);

  // Greeting — if opened from score card, add contextual auto-question
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstName = merchantName ? ` ${merchantName.split(' ')[0]}` : '';
      const greeting = stats
        ? `Hi${firstName}! 👋 I'm **Vest**, your financial advisor inside RETURNi.\n\nHere's a quick look at your numbers right now:\n• **Today's Sales:** ${stats.todaySalesCount} transaction${stats.todaySalesCount !== 1 ? 's' : ''}\n• **Total Volume:** $${stats.totalVol?.USD} USD / ZAR ${stats.totalVol?.ZAR}\n• **Return Rate:** ${stats.returnRate}% — ${Number(stats.returnRate) >= 30 ? "that's healthy! 🟢" : "let's work on growing this 🔵"}\n• **Redemption Rate:** ${stats.redemptionRate}%\n\nFeel free to ask me anything about your sales, backpay, or how to grow your business!`
        : `Hi${firstName}! 👋 I'm **Vest**, your financial advisor inside RETURNi.\n\nAsk me anything about your sales, backpay rewards, or customer retention — I'll break it down in plain language, no finance degree needed! 😊`;

      setMessages([{ id: 'greeting', role: 'vest', text: greeting }]);

      // If opened from the Business Health Score card, auto-ask about the score
      if (hasScoreContext && scoreParam) {
        setTimeout(() => {
          const autoQ = `My Business Health Score is ${scoreParam}/100 (${tierParam ?? 'unknown'} tier). Can you explain what this means for my business and give me a specific plan to improve it using RETURNi\'s BackPay and marketing tools?`;
          sendMessage(autoQ);
        }, 800);
      }
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, merchantName]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContextPrompt = (userMessage: string): string => {
    if (!stats) return userMessage;
    return `[Merchant context — use this to give personalised advice]:
- Today's sales: ${stats.todaySalesCount}
- Total volume: $${stats.totalVol?.USD} USD, ZAR ${stats.totalVol?.ZAR}, ZiG ${stats.totalVol?.ZIG}
- Unclaimed liability: $${stats.unclaimedLiability?.USD} USD, ZAR ${stats.unclaimedLiability?.ZAR}
- Return rate: ${stats.returnRate}%
- Redemption rate: ${stats.redemptionRate}%
- BackPay %: ${stats.merchant?.backpay_percent}%
- Reward expiry: ${stats.merchant?.backpay_expiry_days} days

User question: ${userMessage}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking || cooldown > 0) return;

    const userMsg: UIMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const loadingMsg: UIMessage = { id: 'loading', role: 'vest', text: '', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const reply = await getVestResponse(buildContextPrompt(text.trim()), history);

      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: text.trim() }] },
        { role: 'model', parts: [{ text: reply }] },
      ]);

      setMessages(prev =>
        prev.filter(m => m.id !== 'loading').concat({
          id: Date.now() + '_v',
          role: 'vest',
          text: reply,
        })
      );
    } catch (err: any) {
      const msg: string = err?.message || '';
      const isRateLimit = msg === 'RATE_LIMIT';

      if (isRateLimit) startCooldown();

      setMessages(prev =>
        prev.filter(m => m.id !== 'loading').concat({
          id: 'err_' + Date.now(),
          role: 'vest',
          isError: true,
          text: isRateLimit
            ? `⏱ You're sending messages a bit too quickly — the free tier allows about 15 requests per minute.\n\nI'll be ready again in **${COOLDOWN_SECONDS} seconds**. Sit tight!`
            : msg || 'Something went wrong. Please try again.',
        })
      );
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-returni-dark">{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
      ));
    });
  };

  const isBlocked = isThinking || cooldown > 0;

  return (
    <div className="min-h-screen bg-returni-bg flex flex-col max-w-2xl mx-auto xl:max-w-3xl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-returni-bg border-b border-returni-green/15 px-5 py-4 flex items-center gap-4">
        <Link
          href="/merchant/dashboard"
          className="text-returni-green font-medium text-sm hover:text-returni-darkGreen transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-returni-green flex items-center justify-center shadow-md shadow-green-600/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-returni-bg rounded-full ${cooldown > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          </div>
          <div>
            <p className="font-black text-returni-dark text-sm leading-none">Vest AI</p>
            <p className="text-[10px] text-returni-green font-bold uppercase tracking-widest">Your Financial Advisor</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${cooldown > 0 ? 'bg-amber-50 border-amber-200' : stats ? 'bg-green-50 border-returni-green/20' : 'bg-gray-50 border-gray-100'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cooldown > 0 ? 'bg-amber-400' : 'bg-returni-green'}`} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${cooldown > 0 ? 'text-amber-600' : 'text-returni-green'}`}>
            {cooldown > 0 ? `Ready in ${cooldown}s` : stats ? 'Live Data' : 'Online'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'vest' && (
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm mb-1 ${msg.isError ? 'bg-amber-400' : 'bg-returni-green'}`}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            )}

            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? 'bg-returni-dark text-white rounded-br-sm'
                : msg.isError
                ? 'bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-sm'
                : 'bg-white border border-returni-green/20 text-returni-dark rounded-bl-sm'
            }`}>
              {msg.loading ? (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-2 h-2 bg-returni-green/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 bg-returni-green/60 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-returni-green/80 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              ) : (
                <p className="font-medium">{renderText(msg.text)}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && !isThinking && cooldown === 0 && (
        <div className="px-4 pb-3">
          <p className="text-[9px] font-black text-returni-dark/30 uppercase tracking-widest mb-2 text-center">Try asking</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 text-[11px] font-bold bg-white border border-returni-green/25 text-returni-dark rounded-xl hover:bg-green-50 hover:border-returni-green/50 transition-all active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cooldown bar */}
      {cooldown > 0 && (
        <div className="mx-4 mb-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-[11px] font-bold text-amber-700 flex-1">Rate limit — Vest will be ready in <strong>{cooldown}s</strong></p>
          <div className="w-16 h-1 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${((COOLDOWN_SECONDS - cooldown) / COOLDOWN_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="sticky bottom-0 bg-returni-bg border-t border-returni-green/15 px-4 py-4">
        <div className={`flex items-end gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-colors ${isBlocked ? 'border-gray-100 opacity-60' : 'border-returni-green/25 focus-within:border-returni-green/60'}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={cooldown > 0 ? `Vest is cooling down — ${cooldown}s remaining...` : "Ask Vest about your sales, rewards, or business..."}
            rows={1}
            disabled={isBlocked}
            className="flex-1 resize-none outline-none text-sm font-medium text-returni-dark placeholder:text-returni-dark/30 bg-transparent max-h-28 leading-relaxed disabled:cursor-not-allowed"
            style={{ fieldSizing: 'content' } as any}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isBlocked}
            className="w-9 h-9 rounded-xl bg-returni-green flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-returni-darkGreen transition-all active:scale-90 shadow-md shadow-green-600/20"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[9px] font-bold text-returni-dark/20 uppercase tracking-widest mt-2">
          Vest · Powered by Gemini · RETURNi Financial Advisor
        </p>
      </div>
    </div>
  );
}

export default function VestAIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-returni-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-returni-green border-t-transparent animate-spin" />
      </div>
    }>
      <VestChat />
    </Suspense>
  );
}
