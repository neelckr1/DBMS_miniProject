'use client';

import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function SqlShowcase() {
  const [activeQuery, setActiveQuery] = useState<'multi_join' | 'group_by_having' | 'hybrid_search'>('multi_join');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const queries = [
    {
      id: 'multi_join',
      name: '1. Multi-Table JOIN Query',
      tag: 'JOIN & Subqueries',
      desc: 'Joins 4 tables (users -> search_query -> query_retrieval -> research_paper) with aggregations and subquery.',
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
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Advanced DBMS Query Demonstrator</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Live execution of complex SQL operations directly against PostgreSQL for faculty evaluation.
        </p>
      </div>

      {/* 3 Simple Query Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {queries.map((q) => (
          <button
            key={q.id}
            onClick={() => setActiveQuery(q.id as any)}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activeQuery === q.id
                ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                {q.tag}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 mt-2">{q.name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{q.desc}</p>
          </button>
        ))}
      </div>

      {/* Query Display and Results */}
      {result && (
        <div className="space-y-3">
          {/* SQL Code Box */}
          <div className="bg-gray-950 text-gray-200 rounded-lg p-4 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
              <span className="text-blue-400 font-semibold font-mono">Executed SQL Statement</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                ⚡ {result.executionTimeMs} ms ({result.rowCount} rows)
              </span>
            </div>
            <pre className="font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed py-1">
              {result.sql}
            </pre>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">Query Result Set</span>
              <button
                onClick={() => runQuery(activeQuery)}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                <Play className="w-3 h-3" />
                <span>Re-run Query</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-gray-400">Executing SQL on PostgreSQL...</div>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b sticky top-0">
                    <tr>
                      {result.rows && result.rows.length > 0 &&
                        Object.keys(result.rows[0]).map((key) => (
                          <th key={key} className="p-2.5 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-gray-800">
                    {result.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((val: any, valIdx: number) => (
                          <td key={valIdx} className="p-2.5 whitespace-nowrap max-w-xs truncate">
                            {val === null ? <span className="text-gray-300">NULL</span> : String(val)}
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
