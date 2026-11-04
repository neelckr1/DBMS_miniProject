'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User, Check, AlertCircle } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form states
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [category, setCategory] = useState('Computer Science & Engineering');
  const [publicationDate, setPublicationDate] = useState('2026-01-15');
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

      setMessage({ type: 'success', text: 'Paper successfully added and vectorized!' });
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
    if (!confirm(`Delete "${paperTitle}"? This will trigger database audit logging.`)) return;

    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Paper #${id} deleted.` });
        fetchPapers();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(papers.map((p) => p.category)))];
  const filteredPapers =
    selectedCategory === 'ALL' ? papers : papers.filter((p) => p.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Campus Research Papers</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Institutional repository of academic papers and capstone projects ({papers.length} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Departments' : c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Paper</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Papers List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading research papers...</div>
      ) : (
        <div className="space-y-3">
          {filteredPapers.map((paper) => (
            <div
              key={paper.paper_id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-gray-400">#{paper.paper_id}</span>
                    <span className="px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-800">
                      {paper.category}
                    </span>
                    {paper.has_vector && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                        Vector Indexed
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{paper.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {paper.authors}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {paper.publication_date ? new Date(paper.publication_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(paper.paper_id, paper.title)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete paper"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                {paper.abstract}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Upload Academic Research Paper</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Deep Learning for Medical Diagnostics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Authors</label>
                  <input
                    type="text"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="e.g., A. Sharma, N. Chandrakar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department / Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Abstract (Min. 20 characters)</label>
                <textarea
                  rows={4}
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Paste paper abstract here. Dense vector embedding will be calculated automatically..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                >
                  {submitting ? 'Generating Embeddings...' : 'Submit & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
