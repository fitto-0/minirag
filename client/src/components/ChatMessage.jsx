import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Pencil, Check, X } from 'lucide-react';

export default function ChatMessage({ message, onEdit }) {
  const isUser = message.role === 'user';
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleSave = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit?.(message._id, editText.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditText(message.content);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-neu-accent' : 'bg-neu-text'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {editing ? (
          <div className="neu-card-pressed p-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="neu-card-pressed w-full p-2 text-sm rounded-xl resize-none outline-none bg-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex gap-1 mt-2 justify-end">
              <button onClick={handleCancel} className="neu-button p-1.5">
                <X size={14} className="text-neu-muted" />
              </button>
              <button onClick={handleSave} className="neu-button p-1.5 bg-neu-accent">
                <Check size={14} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className={`neu-card px-4 py-3 text-sm leading-relaxed relative ${
            isUser ? 'bg-neu-accent/5' : ''
          }`}>
            {message.content}
            {message.isEdited && (
              <span className="text-xs text-neu-muted ml-2 italic">(edited)</span>
            )}
            {isUser && onEdit && (
              <button
                onClick={() => setEditing(true)}
                className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity neu-button p-1"
              >
                <Pencil size={12} className="text-neu-muted" />
              </button>
            )}
          </div>
        )}

        {/*
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 px-4 py-2">
            <p className="text-xs text-neu-muted mb-1">Sources:</p>
            {message.sources.map((source, i) => (
              <div key={i} className="text-xs text-neu-muted/70 italic mb-0.5">
                [{i + 1}] {source.text}...
              </div>
            ))}
          </div>
        )}
        */}
      </div>
    </motion.div>
  );
}
