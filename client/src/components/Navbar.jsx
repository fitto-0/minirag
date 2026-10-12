import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MessageSquare, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="neu-card mx-auto my-4 max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between"
    >
      <Link to="/dashboard" className="flex items-center gap-2 text-neu-text">
        <div className="w-8 h-8 rounded-full bg-neu-accent flex items-center justify-center">
          <FileText size={16} className="text-white" />
        </div>
        <span className="font-semibold text-lg">Smart RAG</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <Link
          to="/dashboard"
          className={`neu-button px-4 py-2 flex items-center gap-2 text-sm ${isActive('/dashboard') ? 'shadow-neu-pressed' : ''}`}
        >
          <FileText size={16} />
          Documents
        </Link>
        <Link
          to="/chat"
          className={`neu-button px-4 py-2 flex items-center gap-2 text-sm ${isActive('/chat') ? 'shadow-neu-pressed' : ''}`}
        >
          <MessageSquare size={16} />
          Chat
        </Link>

        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-neu-dark">
          <div className="flex items-center gap-2 text-sm text-neu-muted">
            <User size={14} />
            {user?.name}
          </div>
          <button onClick={handleLogout} className="neu-button p-2">
            <LogOut size={16} className="text-neu-muted" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden neu-button p-2"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 mx-4 mt-2 neu-card p-4 flex flex-col gap-3 md:hidden"
          >
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`neu-button px-4 py-2 flex items-center gap-2 text-sm ${isActive('/dashboard') ? 'shadow-neu-pressed' : ''}`}
            >
              <FileText size={16} />
              Documents
            </Link>
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className={`neu-button px-4 py-2 flex items-center gap-2 text-sm ${isActive('/chat') ? 'shadow-neu-pressed' : ''}`}
            >
              <MessageSquare size={16} />
              Chat
            </Link>

            <div className="flex items-center gap-3 pt-3 border-t border-neu-dark">
              <div className="flex items-center gap-2 text-sm text-neu-muted">
                <User size={14} />
                {user?.name}
              </div>
              <button onClick={handleLogout} className="neu-button p-2">
                <LogOut size={16} className="text-neu-muted" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
