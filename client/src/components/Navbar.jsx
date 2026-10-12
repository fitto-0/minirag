import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const links = [
  { to: '/dashboard', label: 'Documents', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
];

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
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-40 px-3 sm:px-4 pt-3 pb-2 bg-neu-bg/80 backdrop-blur-xl">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative neu-card mx-auto max-w-6xl px-3 sm:px-4 py-2.5 flex items-center justify-between"
      >
        <Logo to="/dashboard" size={32} />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-neu-bg border border-neu-dark">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-4 py-1.5 flex items-center gap-2 text-sm rounded-lg transition-colors ${
                isActive(to) ? 'text-white' : 'text-neu-muted hover:text-neu-text'
              }`}
            >
              {isActive(to) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-ink"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={15} className="relative" />
              <span className="relative">{label}</span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-marker text-ink text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <span className="text-sm text-neu-text max-w-[140px] truncate">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="neu-button p-2" title="Sign out" aria-label="Sign out">
            <LogOut size={15} className="text-neu-muted" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden neu-button p-2"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 neu-card p-3 flex flex-col gap-1 md:hidden"
            >
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-3 flex items-center gap-3 text-sm rounded-xl ${
                    isActive(to) ? 'bg-ink text-white' : 'text-neu-text hover:bg-neu-dark/40'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}

              <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-neu-dark">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-marker text-ink text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm text-neu-text truncate">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="neu-button px-3 py-2 flex items-center gap-2 text-sm text-neu-muted">
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
