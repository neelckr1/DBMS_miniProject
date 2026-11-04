'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User, Tag, Sparkles, Check, AlertCircle } from 'lucide-react';

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

export default function PaperRepository({ userRole }: { userRole: 'ADMIN' | 'RESEARCHER' }) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [category, setCategory] = useState('Machine Learning');
  const [publicationDate, setPublicationDate] = useState('2024-01-15');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);

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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paper');
      }

      setStatusMessage({
        type: 'success',
        text: `Paper created! 384-dimensional dense vector generated and stored.`,
      });

      // Reset form
      setTitle('');
      setAbstract('');
      setAuthors('');
      setShowAddModal(false);
      fetchPapers();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaper = async (paperId: number, paperTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${paperTitle}"?\nThis will test CASCADE delete on vector_embedding and fire the paper_audit_log AFTER DELETE trigger.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/papers/${paperId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Paper #${paperId} deleted. Trigger logged action into paper_audit_log.`,
        });
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
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Paper Repository</h2>
          <p className="text-sm text-slate-500">
            Relational storage (`research_paper`) with 1:1 vector embeddings (`vector_embedding`).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 text-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Research Paper
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat} {cat === 'ALL' ? `(${papers.length})` : ''}
          </button>
        ))}
      </div>

      {/* Papers Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading paper repository...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.paper_id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400">ID #{paper.paper_id}</span>
                    <span className="px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {paper.category}
                    </span>
                    {paper.has_vector && (
                      <span className="px-2 py-0.5 rounded font-medium bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        vector(384) active
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{paper.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {paper.authors}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {paper.publication_date ? new Date(paper.publication_date).toLocaleDateString() : 'N/A'}
                    </span>
                    <span>Uploaded by: <strong className="text-slate-700">{paper.uploaded_by || 'Admin'}</strong></span>
                  </div>
                </div>

                {/* Delete button (tests cascade & audit trigger) */}
                <button
                  onClick={() => handleDeletePaper(paper.paper_id, paper.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Paper (Demonstrates CASCADE and Audit Trigger)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
                {paper.abstract}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Paper Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Upload New Research Paper</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePaper} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Contrastive Language-Image Pretraining (CLIP)"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Authors</label>
                  <input
                    type="text"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="e.g., Radford et al."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Computer Vision, NLP"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Date</label>
                <input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abstract (Min. 20 chars - will be encoded into 384-d vector)
                </label>
                <textarea
                  rows={4}
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Paste the full abstract here. The transformer pipeline will generate its dense vector representation upon submit..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Computing Vector Embedding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Save & Vectorize
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
