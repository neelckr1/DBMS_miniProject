'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SearchSection from '@/components/SearchSection';
import PaperRepository from '@/components/PaperRepository';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SqlShowcase from '@/components/SqlShowcase';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'papers' | 'analytics' | 'sql'>('search');
  const [userRole, setUserRole] = useState<'ADMIN' | 'STUDENT'>('STUDENT');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'search' && <SearchSection userRole={userRole} />}
        {activeTab === 'papers' && <PaperRepository userRole={userRole} />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'sql' && <SqlShowcase />}
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
