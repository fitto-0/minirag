import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ArrowUp, Loader, Plus, X, Trash2, PanelLeft, FileText, Sparkles, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatMessage from '../components/ChatMessage';
import { useChat } from '../contexts/ChatContext';
import { chatAPI, pdfAPI } from '../api/axios';

const suggestions = [
  'Summarize this document in 3 points',
  'What are the key dates mentioned?',
  'List the main people or companies involved',
  'What are the most important numbers?',
];

function HistoryPanel({ chats, currentChat, onSelect, onDelete, onNew, onClose }) {
  return (
    <div className="neu-card p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neu-muted">History</h2>
        {onClose && (
          <button onClick={onClose} className="neu-button p-1.5 lg:hidden" aria-label="Close history">
            <X size={14} className="text-neu-muted" />
          </button>
        )}
      </div>

      <button
        onClick={onNew}
        className="w-full mb-3 py-2.5 rounded-xl bg-ink text-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-neu-accent transition-colors"
      >
        <Plus size={15} />
        New chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 -mx-1 px-1">
        {chats.length === 0 ? (
          <p className="text-xs text-neu-muted text-center py-6">No chats yet</p>
        ) : (
          chats.map((chat) => {
            const active = currentChat?._id === chat._id;
            return (
              <div key={chat._id} className="relative flex items-center group">
                {active && (
                  <motion.span
                    layoutId="history-active"
                    className="absolute inset-0 rounded-xl bg-marker/70"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <button
                  onClick={() => onSelect(chat._id)}
                  className={`relative flex-1 min-w-0 text-left pl-3 pr-9 py-2.5 rounded-xl text-[13px] truncate transition-colors ${
                    active ? 'text-ink font-medium' : 'text-neu-text hover:bg-neu-dark/40'
                  }`}
                >
                  {chat.title}
                </button>
                <button
                  onClick={() => onDelete(chat._id)}
                  className="absolute right-1.5 p-1.5 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-coral/15 transition-all"
                  aria-label="Delete chat"
                >
                  <Trash2 size={13} className="text-neu-muted hover:text-coral" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const {
    chats, currentChat,
    newChat, closeChat, selectChat,
    addMessage, editMessage, deleteChat,
  } = useChat();
  const location = useLocation();

  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(location.state?.pdfId || '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    pdfAPI.getAll().then(res => {
      setPdfs(res.data.pdfs.filter(p => p.status === 'ready'));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentChat?.messages, sending]);

  useEffect(() => {
    // Coming from "Ask" on a document: start fresh instead of reopening the last chat
    if (location.state?.pdfId) {
      initialLoadDone.current = true;
      return;
    }
    if (!initialLoadDone.current && chats.length > 0) {
      initialLoadDone.current = true;
      selectChat(chats[0]._id);
    }
  }, [chats, selectChat, location.state]);

  // Auto-grow the composer
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [question]);

  const sendQuestion = async (text) => {
    const userText = text.trim();
    if (!userText || sending) return;

    setQuestion('');
    setSending(true);

    let chat = currentChat;
    if (!chat) {
      chat = await newChat();
    }

    const existingMessages = chat?.messages || [];
    await addMessage('user', userText);

    const conversationHistory = [...existingMessages, { role: 'user', content: userText }];

    try {
      const res = await chatAPI.query({
        question: userText,
        pdfId: selectedPdf || undefined,
        conversationHistory
      });
      await addMessage('assistant', res.data.answer, res.data.sources);
    } catch (err) {
      await addMessage('assistant', err.response?.data?.message || 'Failed to get response. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuestion(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(question);
    }
  };

  const handleEdit = async (messageId, newContent) => {
    editMessage(messageId, newContent);
  };

  const handleNewChat = async () => {
    closeChat();
    await newChat();
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  const handleSelect = (id) => {
    selectChat(id);
    setDrawerOpen(false);
  };

  const selectedName = pdfs.find((p) => p._id === selectedPdf)?.originalName;
  const isEmpty = !currentChat || currentChat.messages.length === 0;

  const historyProps = {
    chats,
    currentChat,
    onSelect: handleSelect,
    onDelete: deleteChat,
    onNew: handleNewChat,
  };

  return (
    <div className="h-[100dvh] bg-neu-bg flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full px-3 sm:px-4 pb-3 sm:pb-4 flex gap-4">
        {/* Desktop history */}
        <aside className="hidden lg:block w-[260px] flex-shrink-0 min-h-0">
          <HistoryPanel {...historyProps} />
        </aside>

        {/* Mobile history drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="fixed z-50 inset-y-0 left-0 w-[82%] max-w-[300px] p-3 lg:hidden"
              >
                <HistoryPanel {...historyProps} onClose={() => setDrawerOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <section className="flex-1 min-w-0 min-h-0 neu-card flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 sm:px-5 py-3 border-b border-neu-dark">
            <button
              onClick={() => setDrawerOpen(true)}
              className="neu-button p-2 lg:hidden"
              aria-label="Open history"
            >
              <PanelLeft size={16} className="text-neu-muted" />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neu-text truncate">
                {currentChat?.title || 'New conversation'}
              </p>
            </div>

            <label className="relative flex items-center gap-1.5 rounded-xl border border-neu-dark bg-neu-bg pl-2.5 pr-1 py-1 max-w-[46%] sm:max-w-[240px]">
              <FileText size={13} className="text-coral flex-shrink-0" />
              <select
                value={selectedPdf}
                onChange={(e) => setSelectedPdf(e.target.value)}
                className="bg-transparent text-xs text-neu-text py-1 pr-1 outline-none cursor-pointer min-w-0 w-full truncate"
                aria-label="Document to ask about"
              >
                <option value="">All documents</option>
                {pdfs.map((pdf) => (
                  <option key={pdf._id} value={pdf._id}>{pdf.originalName}</option>
                ))}
              </select>
            </label>

            {currentChat && (
              <button
                onClick={closeChat}
                className="neu-button p-2"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={15} className="text-neu-muted" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-5 sm:py-6">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative w-16 h-16 mb-6"
                >
                  <div className="absolute inset-0 rounded-2xl bg-marker rotate-6" />
                  <div className="absolute inset-0 rounded-2xl bg-ink flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-3xl sm:text-4xl text-neu-text"
                >
                  What would you like to <span className="italic">know</span>?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-sm text-neu-muted mt-2 max-w-sm"
                >
                  {pdfs.length === 0
                    ? 'Upload a PDF on the Documents page first, then ask it anything.'
                    : selectedName
                      ? <>Asking about <span className="marker text-neu-text">{selectedName}</span></>
                      : `Asking across all ${pdfs.length} of your documents.`}
                </motion.p>

                {pdfs.length > 0 && (
                  <div className="mt-8 grid sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.06 }}
                        whileHover={{ y: -2 }}
                        onClick={() => sendQuestion(s)}
                        disabled={sending}
                        className="text-left text-[13px] text-neu-text px-4 py-3 rounded-xl border border-neu-dark bg-neu-bg hover:bg-neu-light hover:border-neu-muted/40 transition-colors"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5 max-w-3xl mx-auto">
                {currentChat.messages.map((msg, i) => (
                  <ChatMessage
                    key={msg._id || i}
                    message={msg}
                    onEdit={msg.role === 'user' ? handleEdit : undefined}
                  />
                ))}

                <AnimatePresence>
                  {sending && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-neu-accent flex items-center justify-center flex-shrink-0">
                        <Sparkles size={15} className="text-white animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-tl-md border border-neu-dark bg-neu-bg px-4 py-3 flex items-center gap-2.5">
                        <div className="flex gap-1">
                          {[0, 150, 300].map((d) => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-neu-muted animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                        <span className="text-xs text-neu-muted">Reading your documents</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-neu-dark">
            <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-neu-dark bg-neu-bg p-1.5 pl-4 focus-within:border-neu-accent focus-within:ring-4 focus-within:ring-neu-accent/10 transition-all">
              <MessageSquare size={16} className="text-neu-muted mb-3 flex-shrink-0 hidden sm:block" />
              <textarea
                ref={inputRef}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedName ? `Ask about ${selectedName}…` : 'Ask about your documents…'}
                className="flex-1 resize-none bg-transparent outline-none text-sm py-2.5 max-h-40 placeholder:text-neu-muted/80"
                disabled={sending}
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={sending || !question.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-ink text-white hover:bg-neu-accent transition-colors disabled:opacity-30 disabled:hover:bg-ink flex-shrink-0"
                aria-label="Send"
              >
                {sending ? <Loader size={17} className="animate-spin" /> : <ArrowUp size={18} />}
              </motion.button>
            </div>
            <p className="hidden sm:block text-center text-[11px] text-neu-muted mt-2">
              Answers come only from your documents · Enter to send, Shift + Enter for a new line
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
