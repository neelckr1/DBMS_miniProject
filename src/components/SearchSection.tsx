'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

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

export default function SearchSection({ userRole }: { userRole: 'ADMIN' | 'STUDENT' }) {
  const [queryText, setQueryText] = useState('');
  const [threshold, setThreshold] = useState(0.15);
  const [limit, setLimit] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    'Attention mechanisms and transformers in NLP',
    'Deep residual learning for image recognition',
    'Relational database architecture and ACID transactions',
    'Approximate nearest neighbor search in vector databases',
  ];

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryText: text.trim(),
          userId: userRole === 'ADMIN' ? 1 : 2,
          limit,
          threshold,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search request failed');
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error executing search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="text-center py-4 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Campus Research Papers
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Search using natural language questions or concepts. The vector database matches your intent beyond exact keywords.
        </p>
      </div>

      {/* Main Search Bar Box */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(queryText);
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search by topic, e.g. how do transformers process language..."
              className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base border-0 focus:outline-none focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end px-1">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showFilters
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Search filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Filters drawer */}
        {showFilters && (
          <div className="mt-2 pt-3 border-t border-slate-100 px-3 pb-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Minimum Match:</span>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-slate-900">{Math.round(threshold * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Max Results:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                className="border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 font-semibold text-slate-800 focus:outline-none"
              >
                <option value="3">Top 3</option>
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Topic Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Try searching:</span>
        {suggestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQueryText(q);
              handleSearch(q);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 rounded-lg transition-colors text-left font-medium shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              {results.length} {results.length === 1 ? 'Paper' : 'Papers'} Found
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Retrieved from PostgreSQL vector index
            </span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No matching papers found</p>
              <p className="text-xs text-slate-500">Try lowering the minimum match threshold or typing general keywords.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((paper) => {
                const matchPct = Math.round(paper.similarity_score * 100);
                return (
                  <div
                    key={paper.paper_id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                            Rank #{paper.rank_order}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                            {paper.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Authors: {paper.authors}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                            matchPct >= 60
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {matchPct}% Match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-2.5 border-t border-slate-100">
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
