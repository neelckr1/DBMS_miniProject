'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, BookOpen, Search, Layers, ShieldAlert } from 'lucide-react';

export default function AnalyticsDashboard({ userRole = 'ADMIN' }: { userRole?: 'ADMIN' | 'STUDENT' }) {
  const [data, setData] = useState<{
    paperAnalytics: any[];
    recentSearches: any[];
    categoryInsights: any[];
    auditLogs: any[];
  } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'papers' | 'queries' | 'departments' | 'audit'>('papers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/analytics', {
        headers: {
          'x-user-role': userRole,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch analytics');
      if (json.success) setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Research Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Querying PostgreSQL views: <code>view_paper_analytics</code>, <code>view_recent_search_activity</code>, and <code>view_category_insights</code>
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Papers</p>
            <p className="text-xl font-extrabold text-slate-900">{data?.paperAnalytics.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Search Queries</p>
            <p className="text-xl font-extrabold text-slate-900">{data?.recentSearches.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Departments</p>
            <p className="text-xl font-extrabold text-slate-900">{data?.categoryInsights.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Audit Logs</p>
            <p className="text-xl font-extrabold text-slate-900">{data?.auditLogs.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Clean Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('papers')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'papers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Most Retrieved Papers (View 1)
        </button>

        <button
          onClick={() => setActiveSubTab('queries')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'queries'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Recent Query History (View 2)
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'departments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Department Aggregation (View 3)
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Trigger Audit Log
        </button>
      </div>

      {/* Main View Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading && !data ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading view data from PostgreSQL...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeSubTab === 'papers' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Paper Title</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5 text-center">Total Retrievals</th>
                    <th className="p-3.5 text-center">Unique Users</th>
                    <th className="p-3.5 text-right">Avg Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data?.paperAnalytics.map((p) => (
                    <tr key={p.paper_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">#{p.paper_id}</td>
                      <td className="p-3.5 font-semibold text-slate-900 max-w-sm truncate">{p.title}</td>
                      <td className="p-3.5 text-slate-600">{p.category}</td>
                      <td className="p-3.5 text-center font-bold text-blue-600">{p.total_retrievals}</td>
                      <td className="p-3.5 text-center">{p.unique_researchers_reached}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                        {(Number(p.avg_similarity_score) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === 'queries' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">Query ID</th>
                    <th className="p-3.5">Search Text</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5 text-center">Papers Matched</th>
                    <th className="p-3.5">Top Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data?.recentSearches.map((s) => (
                    <tr key={s.query_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">#{s.query_id}</td>
                      <td className="p-3.5 font-semibold text-slate-900 italic">"{s.query_text}"</td>
                      <td className="p-3.5">{s.user_name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {s.user_role}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-blue-600">{s.papers_matched}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-600">{s.top_matched_paper || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === 'departments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">Department / Category</th>
                    <th className="p-3.5 text-center">Total Papers</th>
                    <th className="p-3.5 text-center">Total Retrievals</th>
                    <th className="p-3.5 text-right">Avg Relevance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data?.categoryInsights.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">{c.category}</td>
                      <td className="p-3.5 text-center font-semibold text-slate-700">{c.total_papers}</td>
                      <td className="p-3.5 text-center font-bold text-blue-600">{c.total_retrievals}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                        {(Number(c.category_avg_relevance) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === 'audit' && (
              <div className="p-5 space-y-2.5">
                {data?.auditLogs && data.auditLogs.length > 0 ? (
                  data.auditLogs.map((log) => (
                    <div key={log.audit_id} className="p-3.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action_type === 'DELETE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.action_type}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(log.changed_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        Paper #{log.paper_id}: <span className="line-through text-slate-400">{log.old_title}</span>{' '}
                        {log.new_title && <span className="font-semibold text-slate-900">→ {log.new_title}</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    No trigger events yet. Update or delete a paper to see this trigger fire live.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
