import React from 'react';

interface CodeBadgeProps {
  children: React.ReactNode;
  className?: string;
}

/** Flat monospace chip for short reference codes (PNR, flight/airline/airport code, slug...). */
export const CodeBadge: React.FC<CodeBadgeProps> = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tracking-wide ${className}`}
  >
    {children}
  </span>
);
