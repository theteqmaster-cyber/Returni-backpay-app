import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
            <div className="flex gap-6 mb-4">
              <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors font-medium">About Us</Link>
              <a href="mailto:hello@returni.app" className="text-sm text-white/60 hover:text-white transition-colors font-medium">Contact</a>
            </div>
            <Link href="/admin/login" className="text-sm text-white/30 hover:text-white/50 transition-colors">
              &copy; 2026 RETURNi. All rights reserved.
            </Link>
          </div>
        </footer>

        <SyncStatus />
      </body>
    </html>
  );
}
