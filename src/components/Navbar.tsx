'use client';

import React from 'react';
import { BookOpen, Search, BarChart3, Database, ShieldCheck, GraduationCap } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'ADMIN' | 'STUDENT';
  setUserRole: (role: 'ADMIN' | 'STUDENT') => void;
}

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                Campus Research Repository
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Semantic Search System
                </span>
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">DBMS Level 3 Multi-Paradigm Platform (PostgreSQL + pgvector)</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>

            <button
              onClick={() => setActiveTab('papers')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'papers'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Repository</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics & Views</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sql'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>SQL Showcase</span>
            </button>
          </nav>

          {/* Role Switcher (RBAC: Admin / Student) */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs text-slate-500 hidden md:inline">Current Role:</span>
            <button
              onClick={() => setUserRole(userRole === 'ADMIN' ? 'STUDENT' : 'ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                userRole === 'ADMIN'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title="Click to toggle between Admin and Student"
            >
              {userRole === 'ADMIN' ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </>
              ) : (
                <>
                  <GraduationCap className="h-3.5 w-3.5" />
                  Student
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
