import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

const statusConfig = {
  ready: { icon: CheckCircle, color: 'text-green-500' },
  processing: { icon: Clock, color: 'text-amber-500' },
  failed: { icon: AlertCircle, color: 'text-red-500' },
};

export default function DocumentCard({ pdf, onDelete, onSelect, selected, onView }) {
  const StatusIcon = statusConfig[pdf.status]?.icon || AlertCircle;
  const statusColor = statusConfig[pdf.status]?.color || 'text-neu-muted';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`neu-card p-4 cursor-pointer transition-all ${selected ? 'ring-2 ring-neu-accent' : ''}`}
      onClick={() => onSelect?.(pdf)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-neu-accent/10 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-neu-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-neu-text truncate">{pdf.originalName}</h3>
            <p className="text-xs text-neu-muted mt-1">
              {(pdf.fileSize / 1024).toFixed(1)} KB
              {pdf.pageCount ? ` · ${pdf.pageCount} pages` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs ${statusColor}`}>
            <StatusIcon size={12} />
            <span className="capitalize">{pdf.status}</span>
          </div>
          {pdf.status === 'ready' && onView && (
            <button
              onClick={(e) => { e.stopPropagation(); onView?.(pdf); }}
              className="neu-button p-1.5"
              title="View PDF"
            >
              <Eye size={14} className="text-neu-muted hover:text-neu-accent" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(pdf._id); }}
            className="neu-button p-1.5"
          >
            <Trash2 size={14} className="text-neu-muted hover:text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
