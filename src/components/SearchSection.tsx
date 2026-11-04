'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Filter, Clock, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface SearchResult {
  retrieval_query_id: number;
  paper_id: number;
  title: string;
  abstract: string;
  authors: string;
  category: string;
  similarity_score: number;
  rank_order: number;
}

export default function SearchSection({ userRole }: { userRole: 'ADMIN' | 'RESEARCHER' }) {
  const [queryText, setQueryText] = useState('');
  const [threshold, setThreshold] = useState(0.2);
  const [limit, setLimit] = useState(5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const sampleQueries = [
    'transformers and attention mechanisms for language modeling',
    'approximate nearest neighbor indexing in high dimensional vector databases',
    'deep residual neural networks for visual image recognition',
    'ACID transaction recovery and query optimization in relational database systems',
    'predicting 3D structures of proteins from amino acid sequences',
  ];

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryText: queryToSearch,
          userId: userRole === 'ADMIN' ? 1 : 2,
          limit,
          threshold,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
      setLatencyMs(Date.now() - startTime);
    } catch (err: any) {
      setError(err.message || 'Error occurred while querying database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Vector Cosine Similarity (&lt;=&gt;) & HNSW Indexing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Semantic Research Paper Retrieval
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6">
            Type natural language concepts, hypotheses, or paper descriptions. The system generates 384-dimensional dense vectors and finds nearest matches in PostgreSQL via stored procedures.
          </p>

          {/* Search Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(queryText);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g., self-attention mechanisms in neural translation..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-slate-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Embedding & Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Execute Search
                </>
              )}
            </button>
          </form>

          {/* Preset Queries */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Try sample queries:</span>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryText(q);
                  handleSearch(q);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors text-left"
              >
                {q.length > 40 ? q.slice(0, 40) + '...' : q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Parameters Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Vector Search Hyperparameters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Cosine Similarity Threshold:</span>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-900">{threshold.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Result Limit (K):</span>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-slate-50 font-semibold"
            >
              <option value="3">3 matches</option>
              <option value="5">5 matches</option>
              <option value="10">10 matches</option>
            </select>
          </div>

          {latencyMs !== null && (
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>{latencyMs}ms end-to-end</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Results List */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Retrieved Papers
              <span className="text-xs font-normal text-slate-500">
                ({results.length} matches found above threshold {threshold})
              </span>
            </h2>
            <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Stored procedure & ACID retrieval log executed
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
              <Layers className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="font-medium text-slate-700">No papers exceeded similarity threshold {threshold}</p>
              <p className="text-xs mt-1">Try lowering the threshold or phrasing your query differently.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((paper) => {
                const matchPct = (paper.similarity_score * 100).toFixed(1);
                return (
                  <div
                    key={paper.paper_id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                            Rank #{paper.rank_order}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {paper.category}
                          </span>
                          <span className="text-xs text-slate-500">Paper ID: {paper.paper_id}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-slate-500">Authors: {paper.authors}</p>
                      </div>

                      {/* Similarity Badge */}
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`inline-block px-3 py-1 rounded-lg text-sm font-extrabold shadow-sm ${
                            paper.similarity_score > 0.8
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : paper.similarity_score > 0.5
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {matchPct}% Match
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          cos_sim: {paper.similarity_score.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                      {paper.abstract}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
