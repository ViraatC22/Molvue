import React from 'react';

export function Button({ variant = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-black text-white hover:bg-black/90',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  };
  return (
    <button className={`${base} ${variants[variant]} px-4 py-2 ${className}`} {...props} />
  );
}