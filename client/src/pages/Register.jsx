import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout, { Field, FormError } from '../components/AuthLayout';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = Math.min(3, Math.floor(password.length / 4));

  return (
    <AuthLayout
      title="Create account"
      subtitle="Your documents, ready to answer questions."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-neu-accent font-medium hover:underline underline-offset-4">Sign in</Link>
        </>
      }
    >
      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          required
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <div>
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-colors duration-300 ${
                  i < strength ? ['bg-coral', 'bg-marker', 'bg-mint'][strength - 1] : 'bg-neu-dark'
                }`}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="group w-full mt-2 py-3.5 rounded-xl flex items-center justify-center gap-2 bg-ink text-white font-medium hover:bg-neu-accent transition-colors disabled:opacity-60"
        >
          {submitting ? <Loader size={18} className="animate-spin" /> : (
            <>
              Create account
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
