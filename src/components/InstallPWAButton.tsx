'use client';

import { useEffect, useState } from 'react';

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if the app is already installed natively
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
       return; // Already installed, don't show the button
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is installed successfully, hide the button
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
       console.log('User accepted the install prompt');
    } else {
       console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return null; // Don't render anything if the browser doesn't support it or it's already installed
  }

  return (
    <button
      onClick={handleInstallClick}
      className="w-full flex items-center justify-center gap-2 bg-returni-dark text-white font-bold py-3 px-6 rounded-2xl shadow-lg border-2 border-returni-dark hover:bg-white hover:text-returni-dark transition-all group mb-6 animate-[popIn_0.3s_ease-out]"
    >
      <svg className="w-5 h-5 text-white group-hover:text-returni-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      Install App on Phone
    </button>
  );
}
