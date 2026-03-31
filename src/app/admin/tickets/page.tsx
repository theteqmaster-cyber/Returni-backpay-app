'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-5xl mx-auto">
      <div className="mb-8">
         <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
            &larr; Back to Admin Dashboard
         </Link>
         <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">
           Support Tickets
         </h1>
         <p className="text-returni-dark/50 font-medium">User-reported issues across the platform</p>
      </div>

      <div className="bg-white overflow-hidden rounded-3xl shadow-xl border border-gray-100 mb-8">
         <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-black text-returni-dark tracking-tight uppercase text-xs">Report Archive ({tickets.length})</h2>
            <button onClick={fetchTickets} className="text-[10px] font-black text-returni-green uppercase tracking-widest hover:underline">
               Refresh List &or;
            </button>
         </div>

         {loading ? (
            <div className="p-20 text-center">
               <div className="w-10 h-10 border-4 border-gray-100 border-t-returni-green rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Retrieving User Reports...</p>
            </div>
         ) : tickets.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium whitespace-pre-wrap leading-relaxed italic">
               The Request Hub is currently empty.{"\n"}No merchant or trader has reported a problem yet.
            </div>
         ) : (
            <div className="divide-y divide-gray-100">
               {tickets.map(t => (
                  <div key={t.id} className="p-8 hover:bg-gray-50/50 transition-colors">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${t.user_role === 'trader' ? 'bg-returni-dark' : 'bg-returni-blue-500'}`}></div>
                           <h3 className="font-black text-returni-dark tracking-tight text-lg">{t.full_name}</h3>
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${t.user_role === 'trader' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-returni-blue'}`}>
                              {t.user_role}
                           </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                           {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-4">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                          &quot;{t.problem_description}&quot;
                        </p>
                     </div>
                     <div className="flex items-center gap-4">
                        <a href={`tel:${t.phone}`} className="text-[10px] font-black text-returni-green uppercase tracking-widest hover:underline flex items-center gap-1">
                           📞 Reach Out: {t.phone}
                        </a>
                        <span className="text-gray-200">|</span>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID: {t.id.split('-')[0]}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
         <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-returni-green"></div>
         <h3 className="text-lg font-black tracking-tight mb-3">Admin Note</h3>
         <p className="text-sm font-medium leading-relaxed opacity-70">
           This represents a raw stream of user reports. There is no automated response system. Admins are encouraged to use the provided phone numbers for direct follow-up if a high-priority issue is detected.
         </p>
      </div>

      <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] py-12 opacity-60">
        &copy; {new Date().getFullYear()} RETURNi HUB INTEGRITY SYSTEM
      </p>
    </main>
  );
}
