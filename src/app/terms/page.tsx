'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Premium Header */}
      <div className="bg-returni-dark text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-returni-green font-bold mb-6 hover:opacity-80 transition-opacity">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Terms of Service & Privacy Policy</h1>
          <p className="text-white/60 text-lg">Last Updated: March 2026</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-returni-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-lg prose-green max-w-none">
          
          <section className="mb-16">
            <h2 className="text-2xl font-black text-returni-dark mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-returni-green/10 text-returni-green flex items-center justify-center text-sm font-bold">01</span>
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to RETURNi. These Terms and Conditions govern your use of the RETURNi platform, which connects Merchants with Customers for the purpose of rewards ("Backpay"). By using our platform, you agree to these terms in full.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-black text-returni-dark mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-returni-green/10 text-returni-green flex items-center justify-center text-sm font-bold">02</span>
              Platform Role (RBZ Compliance)
            </h2>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-700">
              RETURNi is a software-as-a-service (SaaS) provider. We do not hold funds, provide banking services, or act as a money transmitter. All "Backpay" values are merchant-funded and subject to the specific Merchant's ability to honor them.
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-black text-returni-dark mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-returni-green/10 text-returni-green flex items-center justify-center text-sm font-bold">03</span>
              Multi-Currency Handling
            </h2>
            <ul className="space-y-4 text-gray-600">
              <li><strong>Pricing:</strong> Merchants may record transactions in USD, ZAR, or ZiG.</li>
              <li><strong>Redemption:</strong> Backpay rewards are typically calculated in the currency of the original transaction unless otherwise specified.</li>
              <li><strong>Exchange Rates:</strong> Any conversion is at the sole discretion of the Merchant, using either the prevailing interbank rate or their own billboard rate as clearly displayed at their premises.</li>
            </ul>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-black text-returni-dark mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-returni-green/10 text-returni-green flex items-center justify-center text-sm font-bold">04</span>
              Backpay Redemption & Expiry
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600"><strong>Validity Period:</strong> Backpay rewards and their associated codes (QR or 5-character manual) are valid for <span className="text-returni-dark font-bold underline decoration-returni-green decoration-2">7 calendar days</span> from the date of issue.</p>
              <p className="text-gray-600 font-medium">Forfeiture: Codes not redeemed within this period will expire and the value will be forfeited.</p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-black text-returni-dark mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-returni-green/10 text-returni-green flex items-center justify-center text-sm font-bold">05</span>
              Data Protection & Privacy
            </h2>
            <div className="bg-returni-dark text-white p-8 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-returni-green font-bold uppercase tracking-widest text-xs">How We Protect Your Data</h3>
              <p className="text-lg font-medium">We comply with the Cyber Security and Data Protection Act [Chapter 12:07] of Zimbabwe.</p>
              <ul className="space-y-2 text-white/70 text-sm list-disc pl-5">
                <li>We only collect minimum necessary data (e.g., Phone number) to facilitate rewards.</li>
                <li>Data is never sold to third parties.</li>
                <li>We use industry-standard encryption to secure your transaction records.</li>
                <li>Customers have the right to request deletion of their records at any time.</li>
              </ul>
            </div>
          </section>

          <section className="mb-16 pt-16 border-t border-gray-100">
            <h2 className="text-xl font-black text-returni-dark mb-4">For more info, get in touch</h2>
            <p className="text-gray-500 mb-6">Have questions or need help? Reach out to us directly:</p>
            <div className="flex flex-col gap-4">
              <a href="mailto:theteqmaster@gmail.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-returni-green/10 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-returni-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                  <p className="text-returni-dark font-bold">theteqmaster@gmail.com</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hotlines</p>
                  <p className="text-returni-dark font-bold">+263 78 088 4195 | +263 78 853 2354</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
