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

const COOLDOWN_SECONDS = 60;

// ── Language Setup ────────────────────────────────────────────────────────────
type Lang = 'en' | 'sn' | 'nd';

interface LangStrings {
  dashboard: string;
  vestTitle: string;
  vestSub: string;
  statusLive: string;
  statusOnline: string;
  statusReady: string;
  placeholder: string;
  placeholderBlocked: string;
  tryAsking: string;
  clearChat: string;
  footer: string;
  suggested: string[];
  greeting: string;
  greetingNoData: string;
  returnGood: string;
  returnBad: string;
  errRateLimit: string;
  errGeneral: string;
}

const TRANSLATIONS: Record<Lang, LangStrings> = {
  en: {
    dashboard: "Dashboard",
    vestTitle: "Vest AI",
    vestSub: "Your Financial Advisor",
    statusLive: "Live Data",
    statusOnline: "Online",
    statusReady: "Ready in",
    placeholder: "Ask Vest about your sales, rewards, or business...",
    placeholderBlocked: "Vest is cooling down — ",
    tryAsking: "Try asking",
    clearChat: "Clear Chat",
    footer: "Vest · Powered by Gemini · RETURNi Financial Advisor",
    suggested: [
      "What does my return rate actually mean?",
      "Am I issuing too much backpay?",
      "How can I get more customers to come back?",
      "What is my unclaimed liability?",
      "Is my redemption rate good or bad?",
    ],
    greeting: "Hi{name}! 👋 I'm **Vest**, your financial advisor inside RETURNi.\n\nHere's a quick look at your numbers right now:\n• **Today's Sales:** {sales} transaction(s)\n• **Total Volume:** ${usd} USD / ZAR {zar}\n• **Return Rate:** {returnRate}% — {returnComment}\n• **Redemption Rate:** {redemptionRate}%\n\nFeel free to ask me anything about your sales, backpay, or how to grow your business!",
    greetingNoData: "Hi{name}! 👋 I'm **Vest**, your financial advisor inside RETURNi.\n\nAsk me anything about your sales, backpay rewards, or customer retention — I'll break it down in plain language, no finance degree needed! 😊",
    returnGood: "that's healthy! 🟢",
    returnBad: "let's work on growing this 🔵",
    errRateLimit: "⏱ You're sending messages a bit too quickly — the free tier allows about 15 requests per minute.\n\nI'll be ready again in **{secs} seconds**. Sit tight!",
    errGeneral: "Something went wrong. Please try again.",
  },
  sn: {
    dashboard: "Dhibhodhi",
    vestTitle: "Vest AI",
    vestSub: "Mupiweano wako Wezvemari",
    statusLive: "Nhamba Dzechokwadi",
    statusOnline: "Painternet",
    statusReady: "Gadzirira mu",
    placeholder: "Bvunza Vest nezve kutengesa kwako kana bhizinesi...",
    placeholderBlocked: "Vest iri kumbozorora — ",
    tryAsking: "Edza kubvunza",
    clearChat: "Dzima Nhaurirano",
    footer: "Vest · Powered by Gemini · RETURNi Financial Advisor",
    suggested: [
      "Return rate yangu inorevei chaizvo?",
      "Ndiri kupa backpay yakawandisa here?",
      "Ndingaite sei kuti vatengi vangu vadzoke chechipiri?",
      "Chii chinonzi unclaimed liability?",
      "Redemption rate yangu yakanaka here kana kuti yakaipa?",
    ],
    greeting: "Mhoro{name}! 👋 Ndini **Vest**, chipangamazano chako chezvemari mukati meRETURNi.\n\nHona nhamba dzako parizvino:\n• **Sales Nhasi:** {sales} kutenga\n• **Total Volume:** ${usd} USD / ZAR {zar}\n• **Return Rate:** {returnRate}% — {returnComment}\n• **Redemption Rate:** {redemptionRate}%\n\nBvunza chero zvaunoda nezvebhizinesi rako kana kuti zvirongwa zvako!",
    greetingNoData: "Mhoro{name}! 👋 Ndini **Vest**, chipangamazano chako chezvemari.\n\nNdibvunze chero zvine chekuita nezvekutengesa, mibairo, kana kuti kukudza bhizinesi rako!",
    returnGood: "izvi zvakanaka! 🟢",
    returnBad: "ngatiedzekei kukudza izvi 🔵",
    errRateLimit: "⏱ Muri kutumira mameseji nekukasira — free tier inobvumidza mameseji anenge 15 paminiti.\n\nNdichange ndagadzirira mumasekonzi **{secs}**. Ndapota mirirai zvishoma!",
    errGeneral: "Pane chakanganisika. Ndapota edzai zvakare.",
  },
  nd: {
    dashboard: "IDeshibhodi",
    vestTitle: "Vest AI",
    vestSub: "Umcebisi Wakho Wezemali",
    statusLive: "Amanani Aphezulu",
    statusOnline: "Kwe-inthanethi",
    statusReady: "Ilungile ngo",
    placeholder: "Buza u-Vest ngentengiso yakho noma amabhizinisi...",
    placeholderBlocked: "U-Vest uyapholisa — ",
    tryAsking: "Zama ukubuza",
    clearChat: "Sula Ingxoxo",
    footer: "Vest · Powered by Gemini · RETURNi Financial Advisor",
    suggested: [
      "I-return rate yami isho ukuthini ngempela?",
      "Ngikhipha i-backpay enengi kakhulu yini?",
      "Ngenzani ukuthi abathengi bami babuye futhu?",
      "Kuyini i-unclaimed liability yami?",
      "I-redemption rate yami yinhle yini kumbe yimbi?",
    ],
    greeting: "Sawubona{name}! 👋 Ngingu **Vest**, umcebisi wakho wezemali phakathi kweRETURNi.\n\nNanka amanani akho okwamanje:\n• **Sales Namuhla:** {sales} kuthenga\n• **Total Volume:** ${usd} USD / ZAR {zar}\n• **Return Rate:** {returnRate}% — {returnComment}\n• **Redemption Rate:** {redemptionRate}%\n\nBuzela kimi noma yini ngentengiso yakho lokukhulisa ibhizinisi lakho!",
    greetingNoData: "Sawubona{name}! 👋 Ngingu **Vest**, umcebisi wakho wezemali.\n\nNgibuze noma yini mayelana nentengiso, ama-rewards noma ukugcina abathengi bakho!",
    returnGood: "kuhle lokhu! 🟢",
    returnBad: "kumele sisebenze ukukhulisa lokhu 🔵",
    errRateLimit: "⏱ Uthumela imiyalezo ngokushesha kakhulu — i-free tier ivumela imiyalezo e-15 ngomzuzu.\n\nNgizobe ngilungile emizuzwaneni engu-**{secs}**. Lindanyana!",
    errGeneral: "Kukhona okungalunganga. Siza uzame futhi.",
  }
};

const LANG_FLAGS = { en: '🇬🇧', sn: '🇿🇼', nd: '🇿🇼' };

function VestChat() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get('score');
  const tierParam = searchParams.get('tier');
  const hasScoreContext = !!scoreParam;

  const [lang, setLang] = useState<Lang>('en');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [merchantName, setMerchantName] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const t = TRANSLATIONS[lang];

  // 1. Initial Load (LocalStorage + Stats)
  useEffect(() => {
    // Check local storage for language & chat retention
    const savedLang = localStorage.getItem('vest_lang');
    if (savedLang && ['en', 'sn', 'nd'].includes(savedLang)) setLang(savedLang as Lang);

    const savedMsgs = localStorage.getItem('vest_msgs');
    const savedHist = localStorage.getItem('vest_hist');
    
    if (savedMsgs && savedHist) {
      setMessages(JSON.parse(savedMsgs));
      setHistory(JSON.parse(savedHist));
    }

    // Load stats
    const merchantId = localStorage.getItem('returni_merchant_id');
    const name = localStorage.getItem('returni_user_name') || '';
    setMerchantName(name);

    if (merchantId) {
       fetch(`/api/stats?merchantId=${merchantId}`)
         .then(r => r.json())
         .then(data => { if (!data.error) setStats(data); })
         .catch(() => {})
         .finally(() => setIsReady(true));
    } else {
       setIsReady(true);
    }
    
    // Cleanup cooldown
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  // 2. Cooldown timer
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

  // 3. Greeting Initialization (If no history exists)
  useEffect(() => {
    if (!isReady || messages.length > 0) return;

    const timer = setTimeout(() => {
      const firstName = merchantName ? ` ${merchantName.split(' ')[0]}` : '';
      
      let greetingDesc = '';
      if (stats) {
        let rawGreeting = t.greeting;
        const returnComment = Number(stats.returnRate) >= 30 ? t.returnGood : t.returnBad;
        rawGreeting = rawGreeting.replace('{name}', firstName);
        rawGreeting = rawGreeting.replace('{sales}', stats.todaySalesCount);
        rawGreeting = rawGreeting.replace('{usd}', stats.totalVol?.USD);
        rawGreeting = rawGreeting.replace('{zar}', stats.totalVol?.ZAR);
        rawGreeting = rawGreeting.replace('{returnRate}', stats.returnRate);
        rawGreeting = rawGreeting.replace('{returnComment}', returnComment);
        rawGreeting = rawGreeting.replace('{redemptionRate}', stats.redemptionRate);
        greetingDesc = rawGreeting;
      } else {
        greetingDesc = t.greetingNoData.replace('{name}', firstName);
      }

      setMessages([{ id: 'greeting', role: 'vest', text: greetingDesc }]);

      // Score deep link contextual question
      if (hasScoreContext && scoreParam) {
        setTimeout(() => {
          sendMessage(`My Business Health Score is ${scoreParam}/100 (${tierParam ?? 'unknown'} tier). Can you explain what this means for my business and give me a specific plan to improve it!`);
        }, 800);
      }
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, stats, merchantName, lang]); // Rerun greeting if empty & language changes

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Persistence (Retain last 3 exchanges = 6 history parts)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('vest_msgs', JSON.stringify(messages));
      localStorage.setItem('vest_hist', JSON.stringify(history));
    }
  }, [messages, history]);

  // 5. Language Switcher
  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('vest_lang', newLang);
    // If chat is empty except for greeting, we clear it so it re-renders in the new language
    if (messages.length <= 1) {
      setMessages([]); 
      localStorage.removeItem('vest_msgs');
      localStorage.removeItem('vest_hist');
    }
  };

  // 6. Clear Chat
  const clearChat = () => {
    setMessages([]);
    setHistory([]);
    localStorage.removeItem('vest_msgs');
    localStorage.removeItem('vest_hist');
  };

  // 7. Context Builder with Language Logic
  const buildContextPrompt = (userMessage: string, currentLang: Lang): string => {
    let base = ``;
    if (stats) {
      base = `[Merchant context — use this to give personalised advice]:
- Today's sales: ${stats.todaySalesCount}
- Total volume: $${stats.totalVol?.USD} USD, ZAR ${stats.totalVol?.ZAR}, ZiG ${stats.totalVol?.ZIG}
- Unclaimed liability: $${stats.unclaimedLiability?.USD} USD, ZAR ${stats.unclaimedLiability?.ZAR}
- Return rate: ${stats.returnRate}%
- Redemption rate: ${stats.redemptionRate}%
- BackPay %: ${stats.merchant?.backpay_percent}%
- Reward expiry: ${stats.merchant?.backpay_expiry_days} days\n\n`;
    }

    const langInstructions = 
      currentLang === 'sn' ? 'IMPORTANT AI DIRECTIVE: You MUST reply entirely in the Shona language. Always be polite and professional in Shona. Avoid English unless necessary for technical names.' :
      currentLang === 'nd' ? 'IMPORTANT AI DIRECTIVE: You MUST reply entirely in the Ndebele language. Always be polite and professional in Ndebele. Avoid English unless necessary for technical names.' :
      '';

    return `${base}${langInstructions}\n\nUser question: ${userMessage}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking || cooldown > 0) return;

    const userMsg: UIMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const loadingMsg: UIMessage = { id: 'loading', role: 'vest', text: '', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const reply = await getVestResponse(buildContextPrompt(text.trim(), lang), history);

      setHistory(prev => {
        const newHist: ChatMessage[] = [
          ...prev,
          { role: 'user', parts: [{ text: text.trim() }] },
          { role: 'model', parts: [{ text: reply }] },
        ];
        // Only retain last 3 exchanges (+ previous greeting logic stays naturally capped)
        return newHist.slice(-6);
      });

      setMessages(prev => {
        const cleaned = prev.filter(m => m.id !== 'loading').concat({
          id: Date.now() + '_v',
          role: 'vest',
          text: reply,
        });
        // We slice messages to retain the first Greeting (idx 0), and then the last 6 entries (3 exchanges)
        if (cleaned.length > 7) {
            return [cleaned[0], ...cleaned.slice(-6)];
        }
        return cleaned;
      });

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
             ? t.errRateLimit.replace('{secs}', COOLDOWN_SECONDS.toString())
             : t.errGeneral,
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
    <div className="min-h-screen bg-returni-bg flex flex-col max-w-2xl mx-auto xl:max-w-3xl relative">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-returni-bg/90 backdrop-blur-md border-b border-returni-green/15 px-5 py-4 flex items-center gap-4">
        <Link
          href="/merchant/dashboard"
          className="text-returni-green font-medium text-sm hover:text-returni-darkGreen transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:block">{t.dashboard}</span>
        </Link>

        {/* AI Branding */}
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
            <p className="font-black text-returni-dark text-sm leading-none">{t.vestTitle}</p>
            <p className="text-[10px] text-returni-green font-bold uppercase tracking-widest">{t.vestSub}</p>
          </div>
        </div>

        {/* Top Controls: Lang & Clear */}
        <div className="flex items-center gap-2">
           {messages.length > 1 && (
             <button onClick={clearChat} className="bg-red-50 text-red-500 hover:bg-red-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-2 rounded-lg transition-colors flex items-center gap-1.5" title={t.clearChat}>
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               <span className="hidden sm:inline">{t.clearChat}</span>
             </button>
           )}
           <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['en', 'sn', 'nd'] as Lang[]).map(l => (
                <button
                   key={l}
                   onClick={() => handleLanguageChange(l)}
                   className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${lang === l ? 'bg-white shadow-sm text-returni-green' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
                >
                   <span className="mr-1">{LANG_FLAGS[l]}</span> 
                   <span className="hidden sm:inline">{l}</span>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'vest' && (
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm mb-1 ${msg.isError ? 'bg-amber-400' : 'bg-gradient-to-tr from-returni-green to-[#3bda6f]'}`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            )}

            <div className={`max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? 'bg-returni-dark text-white rounded-br-md shadow-gray-900/10'
                : msg.isError
                ? 'bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-md'
                : 'bg-white border border-gray-100/50 text-returni-dark rounded-bl-md shadow-gray-900/5'
            }`}>
              {msg.loading ? (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-2 h-2 bg-returni-green/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 bg-returni-green/60 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-returni-green/80 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              ) : (
                <p className="font-medium whitespace-pre-wrap">{renderText(msg.text)}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && !isThinking && cooldown === 0 && (
        <div className="px-5 pb-4 max-w-xl mx-auto w-full">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">{t.tryAsking}</p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {t.suggested.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-4 py-2 text-xs font-bold bg-white border border-green-50 text-returni-dark rounded-xl hover:bg-green-50 hover:border-returni-green/30 transition-all shadow-sm active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cooldown bar */}
      {cooldown > 0 && (
        <div className="mx-4 mb-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-[11px] font-bold text-amber-700 flex-1">Rate limit — {t.statusReady} <strong>{cooldown}s</strong></p>
          <div className="w-20 h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${((COOLDOWN_SECONDS - cooldown) / COOLDOWN_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="sticky bottom-0 bg-returni-bg/95 backdrop-blur-md border-t border-returni-green/15 px-4 pt-4 pb-6">
        <div className={`flex items-end gap-3 bg-white border rounded-[1.5rem] p-2 pr-3 shadow-md transition-colors ${isBlocked ? 'border-gray-100 opacity-60 bg-gray-50' : 'border-returni-green/20 focus-within:border-returni-green/60 shadow-green-900/5'}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={cooldown > 0 ? `${t.placeholderBlocked}${cooldown}s...` : t.placeholder}
            rows={1}
            disabled={isBlocked}
            className="flex-1 mt-1.5 ml-3 resize-none outline-none text-[15px] font-medium text-returni-dark placeholder:text-gray-300 bg-transparent max-h-32 leading-relaxed disabled:cursor-not-allowed"
            style={{ fieldSizing: 'content' } as any}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isBlocked}
            className="w-10 h-10 rounded-[1rem] bg-returni-green flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-returni-darkGreen transition-all active:scale-95 shadow-md shadow-green-600/30"
          >
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mt-3">
          {t.footer}
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
