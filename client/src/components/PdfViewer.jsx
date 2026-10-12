import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

export default function PdfViewer({ pdfId, pdfName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const pdfUrl = `${API_URL}/pdfs/${pdfId}/view`;

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(pdfUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfUrl]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate flex-1">{pdfName}</h2>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-button p-2"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} className="text-gray-600" />
                </a>
              )}
              <button
                onClick={onClose}
                className="neu-button p-2"
                title="Close"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-gray-100">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-neu-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-red-500 text-sm">Failed to load PDF</p>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title={pdfName}
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
