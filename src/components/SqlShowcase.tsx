'use client';

import React, { useState, useEffect } from 'react';
import { Database, Play, Clock, Code, CheckCircle } from 'lucide-react';

export default function SqlShowcase() {
  const [activeQuery, setActiveQuery] = useState<'multi_join' | 'group_by_having' | 'hybrid_search'>('multi_join');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const queries = [
    {
      id: 'multi_join',
      name: '4-Table JOIN + Subquery',
      tag: 'JOIN & Subqueries',
      desc: 'Joins users, search_query, query_retrieval, and research_paper with aggregation and correlated subquery.',
    },
    {
      id: 'group_by_having',
      name: 'GROUP BY with HAVING & Aggregates',
      tag: 'Aggregations',
      desc: 'Aggregates research papers and query retrievals by category with HAVING condition.',
    },
    {
      id: 'hybrid_search',
      name: 'Full-Text Search vs Vector Distance',
      tag: 'pgvector & FTS',
      desc: 'Compares tsvector keyword ranking against 384-dimensional cosine distance (<=>).',
    },
  ];

  const runQuery = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sql-demo?type=${type}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runQuery(activeQuery);
  }, [activeQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Advanced DBMS Query Demonstrator
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Designed for faculty evaluation: Live execution of complex JOINs, aggregate functions, subqueries, and vector comparisons on PostgreSQL.
        </p>
      </div>

      {/* Query Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {queries.map((q) => (
          <button
            key={q.id}
            onClick={() => setActiveQuery(q.id as any)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeQuery === q.id
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {q.tag}
              </span>
              {activeQuery === q.id && <CheckCircle className="h-4 w-4 text-blue-600" />}
            </div>
            <p className="text-sm font-bold text-slate-900 mt-2">{q.name}</p>
            <p className="text-xs text-slate-500 mt-1 leading-snug">{q.desc}</p>
          </button>
        ))}
      </div>

      {/* Query Display & Results */}
      {result && (
        <div className="space-y-4">
          {/* SQL Code Box */}
          <div className="bg-slate-950 text-slate-200 rounded-xl p-5 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2 text-blue-400 font-semibold font-mono">
                <Code className="h-4 w-4" />
                Executed SQL Statement
              </span>
              <div className="flex items-center gap-3 text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  {result.executionTimeMs} ms
                </span>
                <span>{result.rowCount} rows</span>
              </div>
            </div>

            <pre className="font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed py-2">
              {result.sql}
            </pre>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Query Result Set</h4>
              <button
                onClick={() => runQuery(activeQuery)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                <Play className="h-3 w-3" />
                Re-execute
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Executing SQL on PostgreSQL...</div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b sticky top-0">
                    <tr>
                      {result.rows && result.rows.length > 0 &&
                        Object.keys(result.rows[0]).map((key) => (
                          <th key={key} className="p-3 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, valIdx: number) => (
                          <td key={valIdx} className="p-3 text-slate-700 whitespace-nowrap max-w-xs truncate">
                            {val === null ? <span className="text-slate-300">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
