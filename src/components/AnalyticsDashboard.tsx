'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, History, ShieldAlert, RefreshCw, FileText } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<{
    paperAnalytics: any[];
    recentSearches: any[];
    categoryInsights: any[];
    auditLogs: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return <div className="text-center py-12 text-slate-500">Loading DBMS analytical views...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            DBMS Analytics & Materialized Views
          </h2>
          <p className="text-sm text-slate-500">
            Real-time querying over PostgreSQL Views: <code>view_paper_analytics</code>, <code>view_recent_search_activity</code>, and <code>view_category_insights</code>.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Views
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Papers Tracked</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.paperAnalytics.length || 0}</p>
          <p className="text-xs text-blue-600 mt-1">Indexed with HNSW</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logged Search Queries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.recentSearches.length || 0}</p>
          <p className="text-xs text-emerald-600 mt-1">ACID transactional logs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Domains / Categories</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.categoryInsights.length || 0}</p>
          <p className="text-xs text-purple-600 mt-1">GROUP BY aggregations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger Audit Entries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data?.auditLogs.length || 0}</p>
          <p className="text-xs text-amber-600 mt-1">Logged by DB trigger</p>
        </div>
      </div>

      {/* View 1: view_paper_analytics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Paper Retrieval Analytics (View: <code>view_paper_analytics</code>)
            </h3>
          </div>
          <span className="text-xs text-slate-500">GROUP BY + LEFT JOIN + Aggregate (AVG, MAX, COUNT)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Paper Title</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Total Retrievals</th>
                <th className="p-3 text-center">Unique Researchers</th>
                <th className="p-3 text-right">Avg Similarity</th>
                <th className="p-3 text-right">Max Similarity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.paperAnalytics.map((p) => (
                <tr key={p.paper_id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-400">#{p.paper_id}</td>
                  <td className="p-3 font-medium text-slate-900 max-w-xs truncate">{p.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-blue-600">{p.total_retrievals}</td>
                  <td className="p-3 text-center">{p.unique_researchers_reached}</td>
                  <td className="p-3 text-right font-mono">{Number(p.avg_similarity_score).toFixed(4)}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600">
                    {Number(p.max_similarity_score).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View 2: view_recent_search_activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Recent Search Activity (View: <code>view_recent_search_activity</code>)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Query Logs + Correlated Subquery for Top Paper</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
              <tr>
                <th className="p-3">Query ID</th>
                <th className="p-3">Query Text</th>
                <th className="p-3">Executed By</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Matches</th>
                <th className="p-3">Top Matched Paper</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentSearches.map((s) => (
                <tr key={s.query_id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-400">#{s.query_id}</td>
                  <td className="p-3 font-semibold text-slate-800 italic">"{s.query_text}"</td>
                  <td className="p-3 font-medium text-slate-900">{s.user_name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.user_role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.user_role}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-blue-600">{s.papers_matched}</td>
                  <td className="p-3 max-w-xs truncate font-medium text-slate-700">
                    {s.top_matched_paper || 'None'}
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    {new Date(s.query_time).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: Category Insights + Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View 3: view_category_insights */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <FileText className="h-4 w-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Category Distribution (View: <code>view_category_insights</code>)
            </h3>
          </div>
          <div className="space-y-3">
            {data?.categoryInsights.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-800">{cat.category}</span>
                <div className="flex items-center gap-4 text-slate-600">
                  <span>{cat.total_papers} papers</span>
                  <span className="font-bold text-blue-600">{cat.total_retrievals} retrievals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Table (Trigger verification) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Database Trigger Audit Trail (Table: <code>paper_audit_log</code>)
            </h3>
          </div>

          {data?.auditLogs && data.auditLogs.length > 0 ? (
            <div className="space-y-2">
              {data.auditLogs.map((log) => (
                <div key={log.audit_id} className="p-3 rounded-lg bg-slate-50 text-xs border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
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
                    {log.new_title && <strong className="text-emerald-700">→ {log.new_title}</strong>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No paper modifications yet. Delete or update a paper to see this trigger fire live.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
