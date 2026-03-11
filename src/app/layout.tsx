import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

const SyncStatus = dynamic(() => import('@/components/SyncStatus').then(mod => mod.SyncStatus), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'RETURNi - Customer Retention',
  description: 'Customer retention platform for local businesses',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#2E7D32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-returni-dark bg-returni-bg flex flex-col min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
        
        {/* Global Footer */}
        <footer className="bg-returni-dark text-white py-8 mt-auto">
          <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-returni-blue transition-colors text-sm font-bold">
                 FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-returni-green transition-colors text-sm font-bold">
                 WA
              </a>
            </div>
            <p className="text-sm text-white/60">
              &copy; 2026 RETURNi. All rights reserved.
            </p>
          </div>
        </footer>

        <SyncStatus />
      </body>
    </html>
  );
}
