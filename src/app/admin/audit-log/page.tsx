'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-log')
      .then(r => r.json())
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  return (
    <main className="min-h-screen p-6 bg-returni-bg max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-returni-green font-medium text-sm inline-flex items-center hover:text-returni-darkGreen transition-colors mb-4">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-returni-dark tracking-tight">Admin Audit Log</h1>
        <p className="text-returni-dark/60 text-sm mt-1">Record of every admin action performed in the system</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-returni-dark">Recent Actions (last 100)</h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">Read Only</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <p className="text-gray-400 font-medium">No audit log entries yet.</p>
            <p className="text-gray-300 text-sm mt-2">Run the SQL migration below to enable audit logging.</p>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left text-xs font-mono text-gray-500 max-w-lg mx-auto">
              {`CREATE TABLE IF NOT EXISTS admin_audit_log (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  admin_name TEXT,\n  action TEXT NOT NULL,\n  entity_type TEXT,\n  entity_id TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\nCREATE POLICY "Allow all audit_log" ON admin_audit_log FOR ALL USING (true) WITH CHECK (true);\nALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;`}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log: any) => {
              const d = new Date(log.created_at);
              return (
                <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-returni-blue/10 text-returni-blue flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {log.admin_name?.[0] || 'A'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-returni-dark">
                      <span className="font-black">{log.admin_name || 'Admin'}</span> — {log.action}
                    </p>
                    {log.entity_type && <p className="text-xs text-gray-400 mt-0.5">{log.entity_type}: {log.entity_id}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-gray-300">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
