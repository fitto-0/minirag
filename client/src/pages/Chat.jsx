import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, MessageSquare, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatMessage from '../components/ChatMessage';
import { chatAPI, pdfAPI } from '../api/axios';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [pdfsLoading, setPdfsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadPdfs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPdfs = async () => {
    try {
      const res = await pdfAPI.getAll();
      setPdfs(res.data.pdfs.filter((p) => p.status === 'ready'));
    } catch (err) {
      console.error('Failed to load PDFs:', err);
    } finally {
      setPdfsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await chatAPI.query({ question, pdfId: selectedPdf || undefined });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: err.response?.data?.message || 'Failed to get response. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 flex-1 min-h-0"
        >
          <div className="w-64 flex-shrink-0">
            <div className="neu-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-neu-accent" />
                <h2 className="text-sm font-medium text-neu-text">Documents</h2>
              </div>

              {pdfsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-neu-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : pdfs.length === 0 ? (
                <p className="text-xs text-neu-muted">No processed documents available</p>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedPdf('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      !selectedPdf ? 'bg-neu-accent text-white' : 'hover:bg-neu-dark/20 text-neu-text'
                    }`}
                  >
                    All Documents
                  </button>
                  {pdfs.map((pdf) => (
                    <button
                      key={pdf._id}
                      onClick={() => setSelectedPdf(pdf._id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                        selectedPdf === pdf._id ? 'bg-neu-accent text-white' : 'hover:bg-neu-dark/20 text-neu-text'
                      }`}
                    >
                      {pdf.originalName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="neu-card flex-1 p-4 mb-4 overflow-y-auto max-h-[calc(100vh-220px)]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageSquare size={40} className="text-neu-muted/30 mb-3" />
                  <h2 className="text-lg font-medium text-neu-text mb-1">Ask a question</h2>
                  <p className="text-sm text-neu-muted max-w-sm">
                    Select a document and ask anything about its contents
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-neu-text flex items-center justify-center">
                        <Loader size={16} className="text-white animate-spin" />
                      </div>
                      <div className="neu-card px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-neu-muted/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-neu-muted/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-neu-muted/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about your document..."
                className="neu-input flex-1 px-4 py-3 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="neu-button px-4 flex items-center justify-center bg-neu-accent text-white disabled:opacity-50"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
