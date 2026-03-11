'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">
          Admin Dashboard
        </h1>
        <button
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => {
              router.push('/admin/login')
            })
          }}
          className="text-returni-dark/60 text-sm font-bold bg-white px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Log out
        </button>
      </div>

      <p className="text-returni-dark/60 text-sm font-bold uppercase tracking-widest mb-6">Platform Overview</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-bold mb-2">Total Merchants</p>
          <p className="text-3xl font-black text-returni-green">...</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-returni-dark/60 text-sm font-bold mb-2">Total Agents</p>
          <p className="text-3xl font-black text-returni-green">...</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-t-returni-blue flex flex-col justify-center">
          <p className="text-returni-dark text-sm font-bold mb-2">Total Revenue (Fees)</p>
          <p className="text-3xl font-black text-returni-dark">...</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-t-red-400 flex flex-col justify-center">
          <p className="text-returni-dark text-sm font-bold mb-2">Total Backpay Liability</p>
          <p className="text-3xl font-black text-returni-dark">...</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-returni-dark mb-4 text-xl">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="w-full py-6 rounded-2xl border-2 border-gray-200 bg-white text-returni-dark font-bold text-lg transition-transform hover:-translate-y-1 shadow-sm">Manage Merchants</button>
          <button className="w-full py-6 rounded-2xl border-2 border-gray-200 bg-white text-returni-dark font-bold text-lg transition-transform hover:-translate-y-1 shadow-sm">Manage Agents</button>
        </div>
      </div>
    </main>
  );
}
