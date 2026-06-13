'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Λάθος email ή κωδικός');
      } else {
        router.replace('/dashboard');
      }
    } catch {
      setError('Αποτυχία σύνδεσης');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Αποτυχία εγγραφής');
      } else {
        const result = await signIn('credentials', { email, password, redirect: false });
        if (!result?.error) router.replace('/dashboard');
      }
    } catch {
      setError('Αποτυχία εγγραφής');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT: Hero Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Architectural background — αντικατέστησε το URL με δική σου φωτογραφία αν θέλεις */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=80')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/88 via-[#0F172A]/65 to-[#0F172A]/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo top-left */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B38B59] flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white font-semibold tracking-tight">Mosaikon</span>
          </div>

          {/* Tagline center */}
          <div>
            <p className="text-[#B38B59] text-xs font-semibold tracking-[.18em] uppercase mb-4">
              Housekeeping OS
            </p>
            <h1 className="text-white text-4xl font-bold tracking-tight leading-tight mb-4">
              Κάθε μέρα,<br />ένα νέο πρωινό.
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Οργανώστε δωμάτια, κουκέτες και διαμερίσματα με ακρίβεια και στυλ.
            </p>
          </div>

          {/* Bottom divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/18" />
            <span className="text-white/35 text-[10px] tracking-widest uppercase">
              Mosaikon · {new Date().getFullYear()}
            </span>
            <div className="h-px flex-1 bg-white/18" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] p-6 lg:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#0F172A] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <span className="font-bold text-[#0F172A] tracking-tight">Mosaikon</span>
          </div>

          {/* Glass card */}
          <div
            className="rounded-2xl border p-8"
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.60)',
              boxShadow:
                '0 4px 32px rgba(15,23,42,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
            }}
          >
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                {isSignup ? 'Δημιουργία λογαριασμού' : 'Καλώς ήρθες πίσω'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isSignup ? 'Συμπλήρωσε τα στοιχεία σου' : 'Σύνδεσου στο dashboard'}
              </p>
            </div>

            {/* Tab switcher */}
            <div
              className="flex mb-6 p-1 rounded-xl gap-1"
              style={{ background: 'hsl(210 40% 94%)' }}
            >
              {[
                { key: false, label: 'Σύνδεση' },
                { key: true,  label: 'Εγγραφή' },
              ].map(({ key, label }) => (
                <button
                  key={String(key)}
                  type="button"
                  onClick={() => { setIsSignup(key); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSignup === key
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-rose-50 text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-3">
              {isSignup && (
                <SilkInput
                  type="text"
                  placeholder="Πλήρες όνομα"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  icon={<UserIcon />}
                />
              )}
              <SilkInput
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                icon={<MailIcon />}
              />
              <SilkInput
                type="password"
                placeholder="Κωδικός"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                icon={<LockIcon />}
              />

              {/* Gold CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 hover:brightness-105 active:scale-[0.98]"
                style={{
                  background: loading
                    ? 'hsl(215 20% 65%)'
                    : 'linear-gradient(135deg, #B38B59 0%, #C9A06B 50%, #B38B59 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: loading ? 'none' : '0 2px 16px rgba(179,139,89,0.35)',
                }}
              >
                {loading
                  ? 'Παρακαλώ περίμενε...'
                  : isSignup
                  ? 'Δημιουργία λογαριασμού'
                  : 'Σύνδεση →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable styled input ── */
function SilkInput({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {icon}
      </span>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-150 outline-none"
        style={{
          borderColor: focused ? '#B38B59' : 'hsl(214 32% 88%)',
          boxShadow: focused ? '0 0 0 3px rgba(179,139,89,0.18)' : 'none',
        }}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
      />
    </div>
  );
}

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);