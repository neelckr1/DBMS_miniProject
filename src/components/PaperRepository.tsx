'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User, Search, Check, AlertCircle, Sparkles } from 'lucide-react';

interface Paper {
  paper_id: number;
  title: string;
  abstract: string;
  authors: string;
  category: string;
  publication_date: string;
  upload_date: string;
  uploaded_by: string;
  uploader_role: string;
  has_vector: boolean;
}

export default function PaperRepository({ userRole }: { userRole: 'ADMIN' | 'STUDENT' }) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form states
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [category, setCategory] = useState('Computer Science & Engineering');
  const [publicationDate, setPublicationDate] = useState('2026-02-15');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/papers');
      const data = await res.json();
      if (data.success) {
        setPapers(data.papers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          authors,
          category,
          publicationDate,
          userId: userRole === 'ADMIN' ? 1 : 2,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add paper');

      setMessage({ type: 'success', text: 'Paper successfully added and vectorized into PostgreSQL!' });
      setTitle('');
      setAbstract('');
      setAuthors('');
      setShowModal(false);
      fetchPapers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, paperTitle: string) => {
    if (!confirm(`Delete "${paperTitle}"? This will test foreign key CASCADE and trigger the database audit log.`)) return;

    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Paper #${id} deleted. Trigger recorded action into paper_audit_log.` });
        fetchPapers();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(papers.map((p) => p.category)))];
  const filteredPapers = papers.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authors.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campus Paper Repository</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional catalogue of scholarly publications, theses, and capstone projects ({papers.length} total)
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Paper</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter papers by title or author..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none text-slate-700 font-medium"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'ALL' ? 'All Departments' : c}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Papers List */}
      {loading ? (
        <div className="text-center py-16 text-sm text-slate-500">Loading campus papers...</div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No papers match your search filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPapers.map((paper) => (
            <div
              key={paper.paper_id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-mono text-slate-400 font-semibold">#{paper.paper_id}</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700">
                      {paper.category}
                    </span>
                    {paper.has_vector && (
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        Vector Indexed
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{paper.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <User className="w-3.5 h-3.5" />
                      {paper.authors}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {paper.publication_date ? new Date(paper.publication_date).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-slate-400">
                      Uploaded by: <strong className="text-slate-600 font-medium">{paper.uploaded_by || 'Admin'}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(paper.paper_id, paper.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete paper (tests trigger audit)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2.5 border-t border-slate-100">
                {paper.abstract}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Academic Research Paper</h3>
                <p className="text-xs text-slate-500">Vector embeddings will be generated automatically upon submission.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Deep Learning Architectures for Image Recognition"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authors</label>
                  <input
                    type="text"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="e.g., Aarav Sharma, Neel C."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publication Date</label>
                <input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Abstract (Min. 20 characters)
                </label>
                <textarea
                  rows={4}
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Paste research paper abstract here. The transformer pipeline will encode it into 384 dimensions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  {submitting ? 'Generating 384-d Vector...' : 'Save & Vectorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
