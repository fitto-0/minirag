import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-neu-accent' : 'bg-neu-text'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`neu-card px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'bg-neu-accent/5' : ''
        }`}>
          {message.content}
        </div>
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
      </div>
    </motion.div>
  );
}
