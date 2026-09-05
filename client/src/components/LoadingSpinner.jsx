import React from 'react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses[size]} border-[#2D333E] border-t-white rounded-full animate-spin`}
      />
      {message && <p className="text-xs font-medium text-[#7C8592]">{message}</p>}
    </div>
  );
}
