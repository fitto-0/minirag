import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import DocumentCard from '../components/DocumentCard';
import PdfViewer from '../components/PdfViewer';
import { pdfAPI } from '../api/axios';

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {
    try {
      const res = await pdfAPI.getAll();
      setPdfs(res.data.pdfs);
    } catch (err) {
      console.error('Failed to load PDFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await pdfAPI.upload(formData);
      await loadPdfs();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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

  const handleView = (pdf) => {
    setViewingPdf(pdf);
  };

  return (
    <div className="min-h-screen bg-[#eef0f4]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-neu-text">Your Documents</h1>
            <p className="text-sm text-neu-muted mt-1">Upload and manage your PDF files</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="neu-button px-5 py-3 flex items-center justify-center gap-2 bg-neu-accent text-white font-medium shadow-neu-accent w-full sm:w-auto"
          >
            {uploading ? <Loader size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-neu-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pdfs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="neu-card p-8 sm:p-12 text-center"
          >
            <FileText size={48} className="text-neu-muted/40 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-neu-text mb-2">No documents yet</h2>
            <p className="text-sm text-neu-muted">Upload your first PDF to start analyzing</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {pdfs.map((pdf) => (
                <DocumentCard
                  key={pdf._id}
                  pdf={pdf}
                  onDelete={handleDelete}
                  onSelect={(p) => setSelectedId(p._id === selectedId ? null : p._id)}
                  selected={pdf._id === selectedId}
                  onView={handleView}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
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
