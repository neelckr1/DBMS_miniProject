'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchSection from '@/components/SearchSection';
import PaperRepository from '@/components/PaperRepository';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'papers' | 'analytics'>('search');
  const [userRole, setUserRole] = useState<'ADMIN' | 'STUDENT'>('STUDENT');

  const handleRoleChange = (role: 'ADMIN' | 'STUDENT') => {
    setUserRole(role);
    if (role === 'STUDENT' && activeTab === 'analytics') {
      setActiveTab('search');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        userRole={userRole}
        setUserRole={handleRoleChange}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'search' && <SearchSection userRole={userRole} />}
        {activeTab === 'papers' && <PaperRepository userRole={userRole} />}
        {activeTab === 'analytics' &&
          (userRole === 'ADMIN' ? (
            <AnalyticsDashboard userRole={userRole} />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Admin Privileges Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Institutional analytics, search telemetry, and database audit logs are restricted to campus administrators.
              </p>
              <button
                onClick={() => handleRoleChange('ADMIN')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                Switch to Admin Role
              </button>
            </div>
          ))}
      </main>

      {/* Simple Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Campus Research Repository & Semantic Search System — Level 3 DBMS Mini-Project</p>
          <div className="flex items-center gap-3">
            <span>Role: <strong className="text-gray-700">{userRole}</strong></span>
            <span>•</span>
            <a
              href="https://github.com/neelckr1/DBMS_miniProject"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
