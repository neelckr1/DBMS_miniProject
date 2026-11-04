'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, Clock } from 'lucide-react';

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

  const sampleQueries = [
    'Attention mechanisms and transformers',
    'Deep residual networks for image recognition',
    'Relational database architecture and ACID transactions',
    'Approximate nearest neighbor graph search in vector databases',
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
      {/* Simple Search Header */}
      <div className="text-center pt-4 pb-2 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Search Campus Research Papers</h2>
        <p className="text-sm text-gray-600">
          Enter questions, keywords, or topics in plain English. The vector database finds semantically related papers.
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-300 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(queryText);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search by topic, e.g., how do transformers process language..."
              className="w-full pl-11 pr-4 py-2.5 text-base border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-xs flex items-center gap-1 border border-gray-200"
              title="Toggle search filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Options</span>
            </button>

            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
          </div>
        </form>

        {/* Collapsible Simple Filter Options */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-6 text-xs text-gray-600 px-1">
            <div className="flex items-center gap-2">
              <span>Similarity Threshold:</span>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="font-mono font-semibold text-gray-900">{threshold.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Max Results:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded px-2 py-0.5 bg-gray-50 font-medium"
              >
                <option value="3">3 papers</option>
                <option value="5">5 papers</option>
                <option value="10">10 papers</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Queries */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-500">Suggested:</span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQueryText(q);
              handleSearch(q);
            }}
            className="px-2.5 py-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-md transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
            <span className="font-semibold text-gray-900">
              {results.length} {results.length === 1 ? 'Paper' : 'Papers'} Found
            </span>
            <span className="text-xs text-gray-500">Query logged to database</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500 text-sm">
              No papers found matching that description. Try lowering the threshold or rephrasing your query.
            </div>
          ) : (
            results.map((paper) => {
              const relevancePct = Math.round(paper.similarity_score * 100);
              return (
                <div
                  key={paper.paper_id}
                  className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          Rank #{paper.rank_order}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800">
                          {paper.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 leading-snug">{paper.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Authors: {paper.authors}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">
                        {relevancePct}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                    {paper.abstract}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
