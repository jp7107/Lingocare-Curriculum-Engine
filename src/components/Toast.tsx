'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onUndo, onDismiss, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-4 text-sm">
        <span>{message}</span>
        <button
          onClick={() => {
            onUndo();
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="font-semibold text-[#EC8601] hover:text-[#f5a033] transition-colors whitespace-nowrap"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
