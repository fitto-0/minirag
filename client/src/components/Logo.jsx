import React from 'react';
import { Link } from 'react-router-dom';

// Two stacked pages with a highlighter stroke: documents + the passage we found in them.
export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#17161c" />
      <rect x="13" y="8" width="17" height="21" rx="3" fill="#3442d9" />
      <rect x="9" y="11" width="17" height="21" rx="3" fill="#fbfaf7" />
      <rect x="12" y="16" width="11" height="2" rx="1" fill="#17161c" opacity="0.25" />
      <rect x="11.5" y="20" width="12" height="4" rx="1.5" fill="#ffe27a" />
      <rect x="12" y="21" width="9" height="2" rx="1" fill="#17161c" opacity="0.55" />
      <rect x="12" y="27" width="7" height="2" rx="1" fill="#17161c" opacity="0.25" />
    </svg>
  );
}

export default function Logo({ to = '/', size = 36, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 text-neu-text group ${className}`}>
      <LogoMark size={size} className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="font-semibold text-lg tracking-tight">
        Smart<span className="font-display italic font-normal text-xl ml-0.5">RAG</span>
      </span>
    </Link>
  );
}
