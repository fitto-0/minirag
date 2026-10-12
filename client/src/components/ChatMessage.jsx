import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Pencil, Check, X } from 'lucide-react';

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 group ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-neu-accent flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {editing ? (
          <div className="w-[min(480px,80vw)] rounded-2xl border border-neu-accent bg-neu-light p-2 ring-4 ring-neu-accent/10">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 text-sm resize-none outline-none bg-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex gap-1.5 justify-end">
              <button onClick={handleCancel} className="neu-button p-1.5" aria-label="Cancel edit">
                <X size={14} className="text-neu-muted" />
              </button>
              <button onClick={handleSave} className="p-1.5 rounded-lg bg-ink hover:bg-neu-accent transition-colors" aria-label="Save edit">
                <Check size={14} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex items-start gap-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div
              className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                isUser
                  ? 'bg-ink text-white rounded-2xl rounded-tr-md'
                  : 'bg-neu-bg border border-neu-dark text-neu-text rounded-2xl rounded-tl-md'
              }`}
            >
              {message.content}
              {message.isEdited && (
                <span className={`text-[11px] ml-2 italic ${isUser ? 'text-white/50' : 'text-neu-muted'}`}>(edited)</span>
              )}
            </div>
            {isUser && onEdit && (
              <button
                onClick={() => setEditing(true)}
                className="mt-1.5 p-1.5 rounded-lg text-neu-muted hover:bg-neu-dark/50 hover:text-neu-text opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                aria-label="Edit message"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
