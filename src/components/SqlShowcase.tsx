'use client';

import React, { useState, useEffect } from 'react';
import { Play, Terminal, CheckCircle2 } from 'lucide-react';

export default function SqlShowcase() {
  const [activeQuery, setActiveQuery] = useState<'multi_join' | 'group_by_having' | 'hybrid_search'>('multi_join');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const queries = [
    {
      id: 'multi_join',
      name: '1. Multi-Table JOIN Query',
      tag: 'JOIN & Subqueries',
      desc: 'Joins 4 tables (users -> search_query -> query_retrieval -> research_paper) with aggregations and correlated subquery.',
    },
    {
      id: 'group_by_having',
      name: '2. GROUP BY & HAVING Query',
      tag: 'Aggregates',
      desc: 'Aggregates papers and queries by department with a HAVING filter condition.',
    },
    {
      id: 'hybrid_search',
      name: '3. Full-Text vs Vector Search',
      tag: 'pgvector & FTS',
      desc: 'Compares PostgreSQL tsvector keyword match ranking against 384-d vector cosine distance (<=>).',
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          Advanced DBMS Query Demonstrator
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Live execution of complex SQL operations directly on PostgreSQL for faculty evaluation.
        </p>
      </div>

      {/* 3 Query Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {queries.map((q) => {
          const isSelected = activeQuery === q.id;
          return (
            <button
              key={q.id}
              onClick={() => setActiveQuery(q.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {q.tag}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2">{q.name}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{q.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Query Display and Results */}
      {result && (
        <div className="space-y-3.5">
          {/* SQL Code Box */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
              <span className="text-blue-400 font-semibold font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Executed SQL Statement
              </span>
              <span className="text-emerald-400 font-mono text-[11px] font-medium">
                ⚡ {result.executionTimeMs} ms • {result.rowCount} rows
              </span>
            </div>
            <pre className="font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed py-1">
              {result.sql}
            </pre>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Result Set</span>
              <button
                onClick={() => runQuery(activeQuery)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-all"
              >
                <Play className="w-3 h-3 text-blue-600" />
                <span>Re-run Query</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400">Executing SQL on PostgreSQL...</div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      {result.rows && result.rows.length > 0 &&
                        Object.keys(result.rows[0]).map((key) => (
                          <th key={key} className="p-3 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                    {result.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        {Object.values(row).map((val: any, valIdx: number) => (
                          <td key={valIdx} className="p-3 whitespace-nowrap max-w-xs truncate">
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
