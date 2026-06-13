'use client';
import { useTheme } from 'next-themes';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Hotel,
  LogOut,
  FileDown,
  Calendar,
  Sun,
  Moon,
  Settings,
  Save,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import DormsSection from './dorms-section';
import RoomsSection from './rooms-section';
import HousesSection from './houses-section';

interface DailyPlan {
  id: string;
  date: string;
  finalized: boolean;
  dormBeds: any[];
  roomStatuses: any[];
  houseStatuses: any[];
}

export default function DashboardClient() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'dorms'>('rooms');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0] ?? '');
  }, []);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const fetchPlan = useCallback(async (date: string) => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/plan?date=${date}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data?.plan) setPlan(data.plan);
    } catch (err: any) {
      console.error('Fetch plan error:', err);
      toast.error('Αποτυχία φόρτωσης');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (selectedDate) fetchPlan(selectedDate);
  }, [selectedDate, fetchPlan]);

  const handleSave = async (silent = false) => {
    if (!plan?.id) return false;
    if (!silent) setSaveLoading(true);
    try {
      const res = await fetch('/api/plan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          roomStatuses: plan.roomStatuses,
          houseStatuses: plan.houseStatuses,
          dormBeds: plan.dormBeds,
        }),
      });
      if (res.ok) {
        if (!silent) toast.success('Τα δεδομένα αποθηκεύτηκαν!');
        return true;
      }
    } catch {
      toast.error('Αποτυχία αποθήκευσης');
    } finally {
      setSaveLoading(false);
    }
    return false;
  };

  const handleDownloadPdf = async () => {
    if (!plan?.id) return;
    setPdfLoading(true);
    const saved = await handleSave(true);
    if (!saved) { setPdfLoading(false); return; }
    try {
      const res = await fetch('/api/plan/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `housekeeping-${selectedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('PDF δημιουργήθηκε!');
      }
    } catch {
      toast.error('Αποτυχία δημιουργίας PDF');
    }
    setPdfLoading(false);
  };

  const updateBed = (bedId: string, newStatus: string, cleanerName?: string) => {
    setPlan((prev: any) => ({
      ...prev,
      dormBeds: prev.dormBeds.map((b: any) =>
        b.id === bedId
          ? { ...b, status: newStatus, cleanerName: cleanerName ?? b.cleanerName }
          : b
      ),
    }));
    void fetch('/api/plan/update-bed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bedId, status: newStatus, cleanerName }),
    }).catch(() => toast.error('Αποτυχία αποθήκευσης κουκέτας'));
  };

  const updateRoom = (roomId: string, fields: any) => {
    setPlan((prev: any) => ({
      ...prev,
      roomStatuses: prev.roomStatuses.map((r: any) =>
        r.id === roomId ? { ...r, ...fields } : r
      ),
    }));
    void fetch('/api/plan/update-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: roomId, ...fields }),
    }).catch(() => toast.error('Αποτυχία αποθήκευσης δωματίου'));
  };

  const updateHouse = (houseId: string, fields: any) => {
    setPlan((prev: any) => ({
      ...prev,
      houseStatuses: prev.houseStatuses.map((h: any) =>
        h.id === houseId ? { ...h, ...fields } : h
      ),
    }));
    void fetch('/api/plan/update-house', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: houseId, ...fields }),
    }).catch(() => toast.error('Αποτυχία αποθήκευσης σπιτιού'));
  };

  if (status === 'loading' || !selectedDate || !mounted) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── SILK HEADER ── */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#B38B59] flex items-center justify-center">
              <Hotel className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight text-sm hidden sm:block">
              Mosaikon{' '}
              <span className="text-[#B38B59]">Silk</span>
            </span>
          </div>

          {/* Date picker pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white/85 text-xs"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-[#B38B59] flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-xs [color-scheme:dark] w-28"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Icon buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/settings/login-logs')}
              title="Logs Συνδέσεων"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <ClipboardList className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/settings')}
              title="Settings"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Logout"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/15 transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ── TABS + FAB BUTTONS ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">

          {/* Silk Tab Switcher */}
          <div
            className="flex p-1 rounded-2xl gap-1"
            style={{
              background: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            {(['rooms', 'dorms'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'rooms' ? 'Δωμάτια' : 'Κουκέτες'}
              </button>
            ))}
          </div>

          {/* FAB Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave()}
              disabled={saveLoading || !plan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 hover:brightness-105 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 2px 12px rgba(5,150,105,0.30)',
              }}
            >
              <Save className="w-4 h-4" />
              {saveLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading || !plan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 hover:brightness-105 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #B38B59, #C9A06B)',
                boxShadow: '0 2px 12px rgba(179,139,89,0.35)',
              }}
            >
              <FileDown className="w-4 h-4" />
              {pdfLoading ? 'Δημιουργία...' : 'Λήψη PDF'}
            </button>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        {loading ? (
          /* Skeleton Loading State */
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-36 rounded-2xl"
                  style={{ animationDelay: `${i * 55}ms` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-48 rounded-2xl"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="tab-content-enter">
            {activeTab === 'rooms' && (
              <div className="space-y-8">
                <RoomsSection
                  rooms={plan?.roomStatuses ?? []}
                  onUpdateRoom={updateRoom}
                />
                <HousesSection
                  houses={plan?.houseStatuses ?? []}
                  onUpdateHouse={updateHouse}
                />
              </div>
            )}

            {activeTab === 'dorms' && (
              <DormsSection
                beds={plan?.dormBeds ?? []}
                onUpdateBed={updateBed}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}