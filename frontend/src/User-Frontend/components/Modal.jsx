import React, { useEffect, useRef } from 'react';

export default function Modal({
  visible, title, children, onClose,
  panelClassName = '', overlayClassName = '',
  titleClassName = '', contentClassName = '', closeClassName = '',
}) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 transition-opacity ${overlayClassName || 'bg-black/40 backdrop-blur-sm'}`}
        onClick={onClose} aria-hidden
      />
      <div
        role="dialog" aria-modal="true"
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-95 opacity-0 animate-modal-in ${panelClassName}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-serif text-xl font-bold text-[#2B1D17] ${titleClassName}`}>{title}</h3>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[#2B1D17]/40 hover:bg-gray-100 hover:text-[#2B1D17] transition-colors ${closeClassName}`}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`mt-2 ${contentClassName || 'text-[#2B1D17]/60 text-sm leading-relaxed'}`}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modal-in { animation: modalIn 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
}
