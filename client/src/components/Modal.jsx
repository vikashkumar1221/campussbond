import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className={`relative transform rounded-2xl sm:rounded-3xl bg-[#121417] border border-[#1E2228] text-left shadow-2xl transition-all w-full ${maxWidth} max-h-[88vh] flex flex-col my-auto sm:my-8 overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1E2228] flex-shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-white truncate pr-2">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#7C8592] hover:text-white hover:bg-[#181B20] transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 text-[#E6E9EC] overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
