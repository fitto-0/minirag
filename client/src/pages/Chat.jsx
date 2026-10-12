import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, MessageSquare, Plus, X, Trash2, History } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatMessage from '../components/ChatMessage';
import { useChat } from '../contexts/ChatContext';
import { chatAPI, pdfAPI } from '../api/axios';

export default function Chat() {
  const {
    chats, currentChat, loading,
    newChat, closeChat, selectChat,
    addMessage, editMessage, deleteChat,
  } = useChat();

  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    pdfAPI.getAll().then(res => {
      setPdfs(res.data.pdfs.filter(p => p.status === 'ready'));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  useEffect(() => {
    if (!initialLoadDone.current && chats.length > 0) {
      initialLoadDone.current = true;
      selectChat(chats[0]._id);
    }
  }, [chats, selectChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || sending) return;

    const userText = question.trim();
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
    }
  };

  const handleEdit = async (messageId, newContent) => {
    editMessage(messageId, newContent);
  };

  const handleNewChat = async () => {
    closeChat();
    await newChat();
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-6 flex gap-4 min-h-0">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="neu-card p-3 w-[260px] flex flex-col max-h-[calc(100vh-140px)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-neu-accent" />
                    <h2 className="text-sm font-medium text-neu-text">History</h2>
                  </div>
                  <button onClick={handleNewChat} className="neu-button p-1.5">
                    <Plus size={14} className="text-neu-accent" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                  {chats.length === 0 ? (
                    <p className="text-xs text-neu-muted text-center py-4">No chats yet</p>
                  ) : (
                    chats.map((chat) => (
                      <div key={chat._id} className="flex items-center gap-1 group">
                        <button
                          onClick={() => selectChat(chat._id)}
                          className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-medium truncate transition-all ${
                            currentChat?._id === chat._id
                              ? 'bg-neu-accent text-white'
                              : 'hover:bg-neu-dark/20 text-neu-text'
                          }`}
                        >
                          {chat.title}
                        </button>
                        <button
                          onClick={() => deleteChat(chat._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity neu-button p-1"
                        >
                          <Trash2 size={12} className="text-neu-muted hover:text-red-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-neu-dark/20">
                  <button
                    onClick={handleNewChat}
                    className="w-full neu-button py-2 flex items-center justify-center gap-2 text-xs font-medium text-neu-accent"
                  >
                    <Plus size={14} />
                    New Chat
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="neu-button p-2"
              >
                <History size={16} className="text-neu-muted" />
              </button>

              {currentChat && (
                <>
                  <span className="text-sm font-medium text-neu-text truncate flex-1">
                    {currentChat.title}
                  </span>
                  <button
                    onClick={closeChat}
                    className="neu-button p-2"
                    title="Close chat"
                  >
                    <X size={16} className="text-neu-muted" />
                  </button>
                </>
              )}
            </div>

            <select
              value={selectedPdf}
              onChange={(e) => setSelectedPdf(e.target.value)}
              className="neu-input text-xs px-3 py-2 sm:ml-auto max-w-[160px]"
            >
              <option value="">All Documents</option>
              {pdfs.map((pdf) => (
                <option key={pdf._id} value={pdf._id}>{pdf.originalName}</option>
              ))}
            </select>
          </div>

          <div className="neu-card flex-1 p-4 mb-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {!currentChat || currentChat.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <MessageSquare size={40} className="text-neu-muted/30 mb-3" />
                <h2 className="text-lg font-medium text-neu-text mb-1">Ask a question</h2>
                <p className="text-sm text-neu-muted max-w-sm">
                  {chats.length > 0 ? 'Select a chat or start a new one' : 'Start a new conversation about your documents'}
                </p>
                <button onClick={handleNewChat} className="neu-button mt-4 px-5 py-2.5 flex items-center gap-2 text-sm bg-neu-accent text-white shadow-neu-accent">
                  <Plus size={16} />
                  New Chat
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentChat.messages.map((msg, i) => (
                  <ChatMessage
                    key={msg._id || i}
                    message={msg}
                    onEdit={msg.role === 'user' ? handleEdit : undefined}
                  />
                ))}

                {sending && (
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
              placeholder={currentChat ? "Ask about your document..." : "Start a new chat..."}
              className="neu-input flex-1 px-4 py-3 text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !question.trim()}
              className="neu-button px-4 flex items-center justify-center bg-neu-accent text-white disabled:opacity-50"
            >
              {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
