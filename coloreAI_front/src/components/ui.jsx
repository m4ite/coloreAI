import React from 'react';

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';

  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white',
    ghost: 'text-fg-muted hover:text-fg hover:bg-muted-bg',
    outline:
      'border border-border text-fg-muted hover:text-fg hover:border-fg-muted/60',
    danger:
      'bg-error/10 text-error hover:bg-error/20 border border-error/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId =
    id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-fg-muted"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`w-full bg-card border ${
          error
            ? 'border-error/60 focus:border-error'
            : 'border-border focus:border-accent/60'
        } text-fg placeholder:text-fg-subtle rounded-lg px-3 py-2.5 text-sm transition-colors outline-none ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
}) {
  const variants = {
    default: 'bg-muted-bg text-fg-muted',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
    accent: 'bg-accent/10 text-accent-light',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-semibold text-fg mb-4">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}

export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={`${sizes[size]} animate-spin text-accent`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Divider({ label }) {
  if (!label) {
    return <div className="border-t border-border my-4" />;
  }

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-border" />
      <span className="text-xs text-fg-subtle">{label}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}