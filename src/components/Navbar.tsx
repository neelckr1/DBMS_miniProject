'use client';

import React from 'react';
import { Search, BookOpen, BarChart3, Shield, GraduationCap } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'ADMIN' | 'STUDENT';
  setUserRole: (role: 'ADMIN' | 'STUDENT') => void;
}

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole }: NavbarProps) {
  const navItems = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'papers', label: 'Papers', icon: BookOpen },
    ...(userRole === 'ADMIN' ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
  ];

  const handleToggleRole = () => {
    const nextRole = userRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    setUserRole(nextRole);
    if (nextRole === 'STUDENT' && activeTab === 'analytics') {
      setActiveTab('search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
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

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
              userRole === 'ADMIN'
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="Click to toggle role between Student and Admin"
          >
            {userRole === 'ADMIN' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Student</span>
              </>
            )}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">(click to switch)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
