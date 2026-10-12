import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader, CheckCircle, Layers, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import DocumentCard from '../components/DocumentCard';
import PdfViewer from '../components/PdfViewer';
import { pdfAPI } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(null);
  const fileInputRef = useRef(null);

  const loadPdfs = useCallback(async () => {
    try {
      const res = await pdfAPI.getAll();
      setPdfs(res.data.pdfs);
    } catch (err) {
      console.error('Failed to load PDFs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPdfs();
  }, [loadPdfs]);

  // Refresh while any document is still being processed
  const hasProcessing = pdfs.some((p) => p.status === 'processing');
  useEffect(() => {
    if (!hasProcessing) return undefined;
    const id = setInterval(loadPdfs, 3000);
    return () => clearInterval(id);
  }, [hasProcessing, loadPdfs]);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploadError('');
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('This file is larger than 20 MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await pdfAPI.upload(formData);
      await loadPdfs();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e) => {
    await uploadFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadFile(e.dataTransfer.files[0]);
  };

  const handleDelete = async (id) => {
    try {
      await pdfAPI.delete(id);
      setPdfs((prev) => prev.filter((p) => p._id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const ready = pdfs.filter((p) => p.status === 'ready').length;
  const pages = pdfs.reduce((sum, p) => sum + (p.pageCount || 0), 0);
  const stats = [
    { label: 'Documents', value: pdfs.length, icon: FileText, tint: 'bg-neu-accent/10 text-neu-accent' },
    { label: 'Ready to ask', value: ready, icon: CheckCircle, tint: 'bg-mint/15 text-mint' },
    { label: 'Pages indexed', value: pages, icon: Layers, tint: 'bg-marker/60 text-ink' },
  ];

  return (
    <div className="min-h-screen bg-neu-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm text-neu-muted">{greeting()}, {user?.name?.split(' ')[0]}</p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl tracking-tight text-neu-text">
            Your <span className="italic">library</span>
          </h1>
        </motion.div>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className="neu-card p-3.5 sm:p-5"
            >
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${s.tint}`}>
                <s.icon size={16} />
              </div>
              <p className="mt-3 sm:mt-4 font-display text-3xl sm:text-4xl text-neu-text">{loading ? '–' : s.value}</p>
              <p className="text-[11px] sm:text-xs text-neu-muted mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            disabled={uploading}
            className={`group relative w-full rounded-[22px] border-2 border-dashed px-6 py-8 sm:py-10 transition-all duration-300 overflow-hidden ${
              dragging
                ? 'border-neu-accent bg-neu-accent/[0.06] scale-[1.01]'
                : 'border-neu-dark bg-neu-light/60 hover:border-neu-muted/50 hover:bg-neu-light'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <motion.div
                animate={dragging ? { y: -4, rotate: -6 } : { y: 0, rotate: 0 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  dragging ? 'bg-neu-accent text-white' : 'bg-ink text-white group-hover:bg-neu-accent'
                }`}
              >
                {uploading ? <Loader size={22} className="animate-spin" /> : <Upload size={22} />}
              </motion.div>
              <div>
                <p className="font-medium text-neu-text">
                  {uploading ? 'Uploading…' : dragging ? 'Drop it here' : 'Drop a PDF here, or click to browse'}
                </p>
                <p className="text-sm text-neu-muted mt-0.5">Text-based PDFs, up to 20 MB</p>
              </div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <AnimatePresence>
            {uploadError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-[#c2412b]"
              >
                <AlertCircle size={15} />
                {uploadError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-neu-muted">All documents</h2>
          {hasProcessing && (
            <span className="inline-flex items-center gap-1.5 text-xs text-neu-muted">
              <Loader size={12} className="animate-spin" /> Processing…
            </span>
          )}
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="neu-card p-5 h-[132px] animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-neu-dark/70" />
                  <div className="mt-4 h-3 rounded bg-neu-dark/70 w-3/4" />
                  <div className="mt-2 h-2.5 rounded bg-neu-dark/50 w-1/3" />
                </div>
              ))}
            </div>
          ) : pdfs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="neu-card p-10 sm:p-14 text-center"
            >
              <div className="relative w-20 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-xl bg-neu-dark rotate-6" />
                <div className="absolute inset-0 rounded-xl bg-neu-light border border-neu-dark -rotate-3 p-3 space-y-1.5">
                  <div className="h-1.5 rounded bg-neu-dark w-full" />
                  <div className="h-1.5 rounded bg-marker w-4/5" />
                  <div className="h-1.5 rounded bg-neu-dark w-3/5" />
                </div>
              </div>
              <h3 className="font-display text-3xl text-neu-text">Nothing here yet</h3>
              <p className="text-sm text-neu-muted mt-2">Upload your first PDF and start asking it questions.</p>
            </motion.div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {pdfs.map((pdf, i) => (
                  <DocumentCard
                    key={pdf._id}
                    index={i}
                    pdf={pdf}
                    onDelete={handleDelete}
                    onSelect={(p) => setSelectedId(p._id === selectedId ? null : p._id)}
                    selected={pdf._id === selectedId}
                    onView={setViewingPdf}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {viewingPdf && (
        <PdfViewer
          pdfId={viewingPdf._id}
          pdfName={viewingPdf.originalName}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </div>
  );
}
