import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, MessageSquare, Loader } from 'lucide-react';

const statusConfig = {
  ready: { label: 'Ready', className: 'bg-mint/15 text-[#23865f]' },
  processing: { label: 'Processing', className: 'bg-marker/60 text-ink' },
  failed: { label: 'Failed', className: 'bg-coral/15 text-[#c2412b]' },
};

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentCard({ pdf, onDelete, onSelect, selected, onView, index = 0 }) {
  const navigate = useNavigate();
  const status = statusConfig[pdf.status] || { label: pdf.status, className: 'bg-neu-dark text-neu-muted' };
  const isReady = pdf.status === 'ready';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group neu-card p-5 cursor-pointer transition-shadow hover:shadow-neu-float ${selected ? 'ring-2 ring-neu-accent ring-offset-2 ring-offset-neu-bg' : ''}`}
      onClick={() => onSelect?.(pdf)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative w-11 h-12 flex-shrink-0">
          <div className="absolute inset-0 rounded-lg bg-neu-dark rotate-6 transition-transform duration-300 group-hover:rotate-12" />
          <div className="absolute inset-0 rounded-lg bg-neu-light border border-neu-dark flex items-center justify-center">
            <FileText size={18} className="text-coral" />
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${status.className}`}>
          {pdf.status === 'processing' && <Loader size={10} className="animate-spin" />}
          {status.label}
        </span>
      </div>

      <h3 className="mt-4 font-medium text-neu-text truncate text-sm" title={pdf.originalName}>{pdf.originalName}</h3>
      <p className="text-xs text-neu-muted mt-1">
        {(pdf.fileSize / 1024).toFixed(1)} KB
        {pdf.pageCount ? ` · ${pdf.pageCount} page${pdf.pageCount > 1 ? 's' : ''}` : ''}
        {pdf.createdAt ? ` · ${formatDate(pdf.createdAt)}` : ''}
      </p>

      <div className="mt-4 pt-4 border-t border-neu-dark flex items-center gap-2">
        {isReady && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/chat', { state: { pdfId: pdf._id } }); }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ink text-white text-xs font-medium hover:bg-neu-accent transition-colors"
          >
            <MessageSquare size={13} />
            Ask
          </button>
        )}
        {isReady && onView && (
          <button
            onClick={(e) => { e.stopPropagation(); onView?.(pdf); }}
            className="neu-button p-2"
            title="View PDF"
            aria-label="View PDF"
          >
            <Eye size={14} className="text-neu-muted" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(pdf._id); }}
          className={`neu-button p-2 hover:!border-coral/40 ${isReady ? '' : 'ml-auto'}`}
          title="Delete"
          aria-label="Delete document"
        >
          <Trash2 size={14} className="text-neu-muted group-hover:text-neu-muted hover:!text-coral" />
        </button>
      </div>
    </motion.div>
  );
}
