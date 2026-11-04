'use client';

import React from 'react';
import { Search, BookOpen, BarChart2, Code2, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'ADMIN' | 'STUDENT';
  setUserRole: (role: 'ADMIN' | 'STUDENT') => void;
}

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Simple Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">Campus Research Repository</h1>
            <p className="text-xs text-gray-500 mt-0.5">Semantic Search System</p>
          </div>
        </div>

        {/* Clean Nav Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'papers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>SQL Demo</span>
          </button>
        </nav>

        {/* Simple Role Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Role:</span>
          <button
            onClick={() => setUserRole(userRole === 'ADMIN' ? 'STUDENT' : 'ADMIN')}
            className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              userRole === 'ADMIN'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-blue-50 text-blue-900 border-blue-300'
            }`}
            title="Click to toggle role between Student and Admin"
          >
            <User className="w-3.5 h-3.5" />
            <span>{userRole === 'ADMIN' ? 'Admin' : 'Student'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
