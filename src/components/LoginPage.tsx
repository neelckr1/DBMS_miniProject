'use client';

import React, { useState } from 'react';
import { GraduationCap, Shield, LogIn, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  // Switch tabs & prefill credentials
  const handleSelectRole = (role: 'STUDENT' | 'ADMIN') => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
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
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Check if user's actual database role matches selected portal tab
      if (data.user.role !== selectedRole) {
        throw new Error(
          `Access Denied: Account role is "${data.user.role}". Please switch to the ${data.user.role === 'ADMIN' ? 'Admin' : 'Student'} tab to sign in.`
        );
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Research Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Semantic Search System — Authentication Required
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleSelectRole('STUDENT')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'STUDENT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('ADMIN')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'ADMIN'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin / Faculty</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {/* Role Description Badge */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              selectedRole === 'STUDENT'
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {selectedRole === 'STUDENT' ? (
              <>
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Student Access Privileges:</strong>
                  Semantic research paper search, abstract exploration, and read-only repository browsing.
                </div>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Administrator Privileges:</strong>
                  Paper uploading with automated vector embeddings, record deletion, and access to institutional analytics & audit logs.
                </div>
              </>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
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
                  <span>Sign In to {selectedRole === 'ADMIN' ? 'Admin Portal' : 'Student Portal'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Evaluation Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectRole('STUDENT')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              >
                <div className="font-semibold text-blue-700">Student Account:</div>
                <div className="text-slate-500 truncate">student@campus.edu</div>
                <div className="font-mono text-[10px] text-slate-400">pass: student123</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              >
                <div className="font-semibold text-amber-700">Admin Account:</div>
                <div className="text-slate-500 truncate">admin@campus.edu</div>
                <div className="font-mono text-[10px] text-slate-400">pass: admin123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          DBMS Experiential Learning Level-3 Mini-Project — PostgreSQL + pgvector
        </div>
      </div>
    </div>
  );
}
