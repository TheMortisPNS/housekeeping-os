'use client';

import { useEffect, useState } from 'react';

interface LoginLog {
  id: string;
  userId?: string | null;
  email?: string | null;
  createdAt: string;
}

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/admin/login-logs');

      if (!response.ok) {
        setLogs([]);
        return;
      }

      const data = await response.json();
      setLogs(data?.logs ?? []);
    } catch (error) {
      console.error(error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    const interval = setInterval(() => {
      loadLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatGreekTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('el-GR', {
      timeZone: 'Europe/Athens',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">
            Log Συνδέσεων Χρηστών
          </h1>

          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162d49] transition"
          >
            Ανανέωση
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Φόρτωση...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-500">Δεν υπάρχουν συνδέσεις ακόμα.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1e3a5f] text-white">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Ώρα Ελλάδας</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-200">
                  <td className="p-3">{log.email || '—'}</td>
                  <td className="p-3 text-xs text-slate-500">{log.userId || '—'}</td>
                  <td className="p-3 font-semibold">
                    {formatGreekTime(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="text-xs text-slate-400 mt-4">
          Η λίστα ανανεώνεται αυτόματα κάθε 10 δευτερόλεπτα.
        </p>
      </div>
    </main>
  );
}