'use client';

import React from 'react';
import { Search, BookOpen, BarChart3, Shield, GraduationCap, LogOut, User as UserIcon } from 'lucide-react';
import { AuthUser } from './LoginPage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: AuthUser | null;
  userRole?: 'ADMIN' | 'STUDENT';
  setUserRole?: (role: 'ADMIN' | 'STUDENT') => void;
  onLogout?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  userRole: propUserRole,
  setUserRole,
  onLogout,
}: NavbarProps) {
  const effectiveRole = user?.role || propUserRole || 'STUDENT';

  const navItems = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'papers', label: 'Papers', icon: BookOpen },
    ...(effectiveRole === 'ADMIN' ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
  ];

  const handleToggleRole = () => {
    if (setUserRole) {
      const nextRole = effectiveRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
      setUserRole(nextRole);
      if (nextRole === 'STUDENT' && activeTab === 'analytics') {
        setActiveTab('search');
      }
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

        {/* User Identity & Role Badge / Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs ${
                  effectiveRole === 'ADMIN'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {effectiveRole === 'ADMIN' ? (
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="hidden sm:inline font-bold">{user.full_name}</span>
                <span className="sm:hidden font-bold">{effectiveRole === 'ADMIN' ? 'Admin' : 'Student'}</span>
                <span className="hidden md:inline text-[10px] opacity-75">
                  ({effectiveRole === 'ADMIN' ? 'Admin' : 'Student'})
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all"
                  title="Sign out of repository"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleToggleRole}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                effectiveRole === 'ADMIN'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Toggle role between Student and Admin"
            >
              {effectiveRole === 'ADMIN' ? (
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
          )}
        </div>
      </div>
    </header>
  );
}
