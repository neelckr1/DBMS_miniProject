'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchSection from '@/components/SearchSection';
import PaperRepository from '@/components/PaperRepository';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SqlShowcase from '@/components/SqlShowcase';
import { Database, GitBranch, Layers, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'papers' | 'analytics' | 'sql'>('search');
  const [userRole, setUserRole] = useState<'ADMIN' | 'STUDENT'>('STUDENT');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && <SearchSection userRole={userRole} />}
        {activeTab === 'papers' && <PaperRepository userRole={userRole} />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'sql' && <SqlShowcase />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-800">Campus Research Repository</span>
            <span>— Semantic Search System (PostgreSQL 17 + pgvector + Next.js)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Role: <strong>{userRole}</strong>
            </span>
            <a
              href="https://github.com/neelckr1/DBMS_miniProject"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-semibold"
            >
              <GitBranch className="h-3.5 w-3.5" />
              neelckr1/DBMS_miniProject
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
