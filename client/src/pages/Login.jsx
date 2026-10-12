import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout, { Field, FormError } from '../components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-neu-accent font-medium hover:underline underline-offset-4">Create an account</Link>
        </>
      }
    >
      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="group w-full mt-2 py-3.5 rounded-xl flex items-center justify-center gap-2 bg-ink text-white font-medium hover:bg-neu-accent transition-colors disabled:opacity-60"
        >
          {submitting ? <Loader size={18} className="animate-spin" /> : (
            <>
              Sign in
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
