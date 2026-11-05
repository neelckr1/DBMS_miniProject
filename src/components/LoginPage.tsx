'use client';

import React, { useState } from 'react';
import { GraduationCap, Shield, LogIn, AlertCircle, Lock, Mail, ShieldCheck, HelpCircle } from 'lucide-react';

export interface AuthUser {
  user_id: number;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'STUDENT';
}

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleRoleTabChange = (role: 'STUDENT' | 'ADMIN') => {
    setSelectedRole(role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (selectedRole === 'ADMIN' && data.user.role !== 'ADMIN') {
        throw new Error('Access denied: Administrator privileges required. Please use the Student Portal.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans">
      {/* Top Institutional Header */}
      <header className="bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                Campus Research Repository
              </span>
              <span className="text-xs text-slate-500 block">
                Semantic Search System
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 hidden sm:inline" />
            <span className="hidden sm:inline">Secure Institutional Portal</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Form Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Sign In</h2>
            <p className="text-xs text-slate-500">
              Enter your university credentials to access the academic repository
            </p>
          </div>

          {/* Role Portal Selection Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleTabChange('STUDENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'STUDENT'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('ADMIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin / Faculty</span>
            </button>
          </div>

          {/* Role Context Notice */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              selectedRole === 'STUDENT'
                ? 'bg-blue-50/70 text-blue-900 border-blue-200'
                : 'bg-amber-50/70 text-amber-900 border-amber-200'
            }`}
          >
            {selectedRole === 'STUDENT' ? (
              <>
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Student Access:</strong>
                  Natural language vector search, explore department publications, and access research papers (read-only).
                </div>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Administrator Access:</strong>
                  Full repository control: upload papers with automated vectorization, manage records, and inspect analytics & audit logs.
                </div>
              </>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Institutional Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@campus.edu"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 transition-all placeholder:text-slate-400 font-sans"
              />
            </div>

            {/* Forgot Password Accordion Notice */}
            {showForgotNotice && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Password Reset Support</span>
                  Institutional credentials are managed by campus directory services. Please contact the IT Helpdesk at <span className="font-mono text-blue-600">it-support@campus.edu</span> or visit room B-204 with your campus ID.
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 rounded-md"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[11px] text-slate-400">PostgreSQL RBAC</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                selectedRole === 'STUDENT'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'Student'}</span>
                </>
              )}
            </button>
          </form>

          {/* Real Institutional Security Notice Footer */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Encrypted with bcrypt (10 rounds) & pgvector RBAC policy</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer matching Dashboard */}
      <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Campus Research Repository & Semantic Search System — Level 3 DBMS Mini-Project</p>
          <div className="flex items-center gap-3">
            <span>PostgreSQL 17</span>
            <span>•</span>
            <span>pgvector 0.8.7</span>
            <span>•</span>
            <a
              href="https://github.com/neelckr1/DBMS_miniProject"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-blue-600 font-medium"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
