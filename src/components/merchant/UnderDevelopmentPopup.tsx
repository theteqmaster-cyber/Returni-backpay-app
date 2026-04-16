'use client';

import { useEffect, useState } from 'react';

interface UnderDevelopmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function UnderDevelopmentPopup({ isOpen, onClose, title = "Feature Under Development" }: UnderDevelopmentPopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-returni-dark/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow behind the gears */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-returni-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 text-center relative z-10">
          
          {/* Animated SVG Graphic */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            {/* Spinning background gear */}
            <svg 
              className="absolute inset-0 w-24 h-24 text-returni-blue/20 animate-[spin_10s_linear_infinite]" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M19.333 14.667a7.667 7.667 0 10-14.666 0v2h14.666v-2zm-7.333-5a1.667 1.667 0 110 3.333 1.667 1.667 0 010-3.333z" />
            </svg>
            
            {/* Main Gear */}
            <svg 
              className="w-16 h-16 text-returni-blue animate-[spin_6s_linear_infinite_reverse]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            {/* Sparkles */}
            <svg className="absolute -top-2 -right-2 w-6 h-6 text-[#2fbb5e] animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" /></svg>
            <svg className="absolute -bottom-1 -left-1 w-4 h-4 text-[#2fbb5e] animate-bounce" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" /></svg>
          </div>

          <h3 className="text-xl font-black text-returni-dark tracking-tight mb-2">
            {title}
          </h3>
          
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
            We are actively building this feature! Our engineers are hard at work connecting this integration for the next major RETURNi update. Stay tuned.
          </p>

          <button 
            onClick={onClose}
            className="w-full bg-returni-dark hover:bg-black text-white font-bold tracking-widest text-xs uppercase py-4 rounded-xl transition-all active:scale-95 shadow-md shadow-gray-200"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
