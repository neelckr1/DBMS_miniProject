'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<{
    paperAnalytics: any[];
    recentSearches: any[];
    categoryInsights: any[];
    auditLogs: any[];
  } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'papers' | 'queries' | 'departments' | 'audit'>('papers');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Database Analytics & Views</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Querying PostgreSQL views (<code>view_paper_analytics</code>, <code>view_recent_search_activity</code>, <code>view_category_insights</code>)
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-[11px] text-gray-500 font-medium">Total Papers</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.paperAnalytics.length || 0}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-[11px] text-gray-500 font-medium">Queries Logged</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.recentSearches.length || 0}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-[11px] text-gray-500 font-medium">Departments</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.categoryInsights.length || 0}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-[11px] text-gray-500 font-medium">Audit Trail Events</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.auditLogs.length || 0}</p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('papers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'papers'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Paper Retrieval Stats (View 1)
        </button>

        <button
          onClick={() => setActiveSubTab('queries')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'queries'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Search Query History (View 2)
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'departments'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Department Aggregates (View 3)
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'audit'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Trigger Audit Log
        </button>
      </div>

      {/* View Content Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading && !data ? (
          <div className="text-center py-10 text-xs text-gray-500">Loading view data...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeSubTab === 'papers' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Paper Title</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Total Retrievals</th>
                    <th className="p-3 text-center">Unique Users</th>
                    <th className="p-3 text-right">Avg Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {data?.paperAnalytics.map((p) => (
                    <tr key={p.paper_id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-400">#{p.paper_id}</td>
                      <td className="p-3 font-medium text-gray-900 max-w-sm truncate">{p.title}</td>
                      <td className="p-3 text-gray-600">{p.category}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{p.total_retrievals}</td>
                      <td className="p-3 text-center">{p.unique_researchers_reached}</td>
                      <td className="p-3 text-right font-mono font-medium">
                        {(Number(p.avg_similarity_score) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === 'queries' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Query Text</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-center">Matches</th>
                    <th className="p-3">Top Matched Paper</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {data?.recentSearches.map((s) => (
                    <tr key={s.query_id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-400">#{s.query_id}</td>
                      <td className="p-3 font-medium text-gray-900 italic">"{s.query_text}"</td>
                      <td className="p-3">{s.user_name}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {s.user_role}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-blue-600">{s.papers_matched}</td>
                      <td className="p-3 max-w-xs truncate text-gray-600">{s.top_matched_paper || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === 'departments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-3">Department / Category</th>
                    <th className="p-3 text-center">Total Papers</th>
                    <th className="p-3 text-center">Total Retrieval Events</th>
                    <th className="p-3 text-right">Avg Category Relevance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {data?.categoryInsights.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{c.category}</td>
                      <td className="p-3 text-center font-semibold text-gray-700">{c.total_papers}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{c.total_retrievals}</td>
                      <td className="p-3 text-right font-mono font-medium">
                        {(Number(c.category_avg_relevance) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === 'audit' && (
              <div className="p-4 space-y-2">
                {data?.auditLogs && data.auditLogs.length > 0 ? (
                  data.auditLogs.map((log) => (
                    <div key={log.audit_id} className="p-3 bg-gray-50 rounded-lg text-xs border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.action_type === 'DELETE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.action_type}
                        </span>
                        <span className="text-gray-400 font-mono text-[10px]">
                          {new Date(log.changed_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">
                        Paper #{log.paper_id}: <span className="line-through text-gray-400">{log.old_title}</span>{' '}
                        {log.new_title && <span className="font-semibold text-gray-900">→ {log.new_title}</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    No trigger events yet. Update or delete a paper to see the database trigger write to this audit table.
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
