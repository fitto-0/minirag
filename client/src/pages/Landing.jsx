import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Shield, Zap } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Upload PDFs', desc: 'Securely upload and process multi-page documents' },
  { icon: Zap, title: 'AI-Powered', desc: 'Llama 3.3 analyzes your documents with precision' },
  { icon: MessageSquare, title: 'Smart Chat', desc: 'Ask questions and get context-aware answers' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your documents stay encrypted and private' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#eef0f4] flex flex-col">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between max-w-6xl mx-auto w-full px-6 py-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-neu-accent flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-neu-text">Smart RAG</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="neu-button px-5 py-2.5 text-sm font-medium">Sign In</Link>
          <Link to="/register" className="neu-button px-5 py-2.5 text-sm font-medium bg-neu-accent text-white shadow-neu-accent">
            Get Started
          </Link>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl font-bold text-neu-text mb-4">
            Your Documents,<br />
            <span className="text-neu-accent">Intelligently Analyzed</span>
          </h1>
          <p className="text-neu-muted text-lg mb-8">
            Upload PDFs and chat with your documents using cutting-edge RAG technology.
            Get precise answers powered by Llama 3.3.
          </p>
          <Link
            to="/register"
            className="neu-button inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium bg-neu-accent text-white shadow-neu-accent"
          >
            <Zap size={18} />
            Start Analyzing
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl"
        >
          {features.map((feature, i) => (
            <div key={i} className="neu-card p-5 text-center">
              <feature.icon size={24} className="text-neu-accent mx-auto mb-3" />
              <h3 className="font-medium text-sm text-neu-text mb-1">{feature.title}</h3>
              <p className="text-xs text-neu-muted">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
