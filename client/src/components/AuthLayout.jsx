import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';

// Split layout shared by the sign-in and sign-up pages: form on the left,
// an ink panel with a small product vignette on the right (hidden on mobile).
export default function AuthLayout({ title, subtitle, children, footer }) {
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMarked(true), 1100);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="min-h-screen bg-neu-bg grid lg:grid-cols-2">
      <div className="relative flex flex-col px-5 sm:px-10 py-6 sm:py-8">
        <div className="absolute inset-0 dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />

        <div className="relative flex items-center justify-between">
          <Logo to="/" size={34} />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-neu-muted hover:text-neu-text transition-colors">
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back home</span>
          </Link>
        </div>

        <div className="relative flex-1 flex items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-neu-text">{title}</h1>
            <p className="mt-2 text-neu-muted text-sm sm:text-base">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-neu-muted">{footer}</div>}
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:block p-3">
        <div className="relative h-full rounded-[28px] bg-ink overflow-hidden grain flex items-center justify-center p-12">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-neu-accent/40 blur-[110px] animate-drift" />
          <div className="absolute bottom-0 -left-20 w-[320px] h-[320px] rounded-full bg-marker/20 blur-[100px] animate-drift-slow" />

          <div className="relative w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-neu-light rounded-2xl p-6 shadow-2xl"
            >
              <p className="text-[11px] uppercase tracking-wider text-neu-muted mb-3">Research_Paper.pdf · p. 4</p>
              <p className="text-sm text-neu-muted leading-relaxed">
                The study followed 1,200 participants over three years.{' '}
                <span className={`marker-sweep text-neu-text ${marked ? 'is-marked' : ''}`}>
                  Sleep quality improved in 68% of the treatment group
                </span>
                , compared to 31% of the control group.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 1.5 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative -mt-3 ml-10 bg-neu-accent text-white rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center gap-2 text-white/70 text-[11px] uppercase tracking-wider mb-2">
                <Sparkles size={12} /> Answer
              </div>
              <p className="text-sm leading-relaxed">
                68% of the treatment group slept better, more than double the control group's 31%.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-12"
            >
              <p className="font-display text-4xl text-white leading-tight">
                Every answer, <span className="italic text-marker">underlined</span> in the source.
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm text-white/50">
                <ShieldCheck size={15} className="text-mint" />
                Every question checked by the Security Judge
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-[#c2412b]"
      role="alert"
    >
      {children}
    </motion.div>
  );
}

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neu-text mb-1.5">{label}</span>
      <input className="neu-input w-full px-4 py-3 text-sm" {...props} />
    </label>
  );
}
