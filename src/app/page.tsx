'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SearchSection from '@/components/SearchSection';
import PaperRepository from '@/components/PaperRepository';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import LoginPage, { AuthUser } from '@/components/LoginPage';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'papers' | 'analytics'>('search');

  // Restore session from localStorage on mount if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('campus_research_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('campus_research_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('search');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('campus_research_user');
    } catch (e) {
      console.error(e);
    }
    setActiveTab('search');
  };

  // Mandatory Authentication Gate: Render LoginPage if not authenticated
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        user={currentUser}
        userRole={currentUser.role}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'search' && (
          <SearchSection userRole={currentUser.role} userId={currentUser.user_id} />
        )}
        {activeTab === 'papers' && (
          <PaperRepository userRole={currentUser.role} userId={currentUser.user_id} />
        )}
        {activeTab === 'analytics' &&
          (currentUser.role === 'ADMIN' ? (
            <AnalyticsDashboard userRole={currentUser.role} />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Admin Privileges Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Institutional analytics, search telemetry, and database audit logs are restricted to campus administrators.
              </p>
            </div>
          ))}
      </main>

      {/* Simple Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Campus Research Repository & Semantic Search System — Level 3 DBMS Mini-Project</p>
          <div className="flex items-center gap-3">
            <span>
              Authenticated as: <strong className="text-gray-700">{currentUser.full_name}</strong> ({currentUser.role})
            </span>
            <span>•</span>
            <button
              onClick={handleLogout}
              className="text-rose-600 hover:underline font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
