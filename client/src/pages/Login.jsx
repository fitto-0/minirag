import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="neu-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neu-accent flex items-center justify-center mx-auto mb-3">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neu-text">Welcome Back</h1>
          <p className="text-neu-muted text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="neu-card-pressed p-3 mb-4 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neu-text mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neu-input w-full px-4 py-3 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neu-text mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neu-input w-full px-4 py-3 text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="neu-button w-full py-3 flex items-center justify-center gap-2 bg-neu-accent text-white font-medium shadow-neu-accent"
          >
            <LogIn size={18} />
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-neu-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-neu-accent font-medium">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
