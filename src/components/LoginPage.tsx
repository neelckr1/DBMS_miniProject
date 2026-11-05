'use client';

import React, { useState } from 'react';
import { GraduationCap, Shield, LogIn, AlertCircle, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';

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
  const [email, setEmail] = useState('student@campus.edu');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleTabChange = (role: 'STUDENT' | 'ADMIN') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'STUDENT') {
      setEmail('student@campus.edu');
      setPassword('student123');
    } else {
      setEmail('admin@campus.edu');
      setPassword('admin123');
    }
  };

  const handleLogin = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const loginEmail = directEmail || email;
    const loginPassword = directPassword || password;

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'STUDENT' | 'ADMIN') => {
    if (role === 'STUDENT') {
      setSelectedRole('STUDENT');
      setEmail('student@campus.edu');
      setPassword('student123');
      handleLogin(undefined, 'student@campus.edu', 'student123');
    } else {
      setSelectedRole('ADMIN');
      setEmail('admin@campus.edu');
      setPassword('admin123');
      handleLogin(undefined, 'admin@campus.edu', 'admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans">
      {/* Top Simple Header matching Dashboard Theme */}
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
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            PostgreSQL 17 + pgvector Multi-Paradigm DB
          </span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Sign In</h2>
            <p className="text-xs text-slate-500">
              Select your role portal to access academic publications & semantic search
            </p>
          </div>

          {/* Role Portal Tabs (matching dashboard navigation pills) */}
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
                  Explore campus research, run natural-language vector queries, and browse the paper repository (read-only).
                </div>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Administrator Access:</strong>
                  Full repository management: upload papers with automated vector generation, delete records, and access institutional analytics & audit logs.
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

          {/* Form */}
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
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 transition-colors"
              />
            </div>

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

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Quick 1-Click Evaluation Sign In
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('STUDENT')}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-slate-700 transition-all group"
              >
                <div className="font-bold text-blue-600 flex items-center justify-between">
                  <span>Student Demo</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Aarav Sharma</div>
                <div className="font-mono text-[10px] text-slate-400">pass: student123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 text-slate-700 transition-all group"
              >
                <div className="font-bold text-amber-700 flex items-center justify-between">
                  <span>Admin Demo</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Dr. Neel Chandrakar</div>
                <div className="font-mono text-[10px] text-slate-400">pass: admin123</div>
              </button>
            </div>
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
