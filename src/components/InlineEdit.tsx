'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  isTitle?: boolean;
  autoFocus?: boolean;
  titleClassName?: string; // per-level title typography (size/weight/color)
}

export function InlineEdit({ value, onSave, placeholder, isTitle, autoFocus, titleClassName }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft when value changes externally (e.g. undo)
  const startEditing = useCallback(() => {
    setDraft(value);
    setIsEditing(true);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      const el = isTitle ? inputRef.current : textareaRef.current;
      if (el) {
        el.focus();
        if (!isTitle && el instanceof HTMLTextAreaElement) {
          el.setSelectionRange(draft.length, draft.length);
        }
      }
    }
  }, [isEditing, isTitle, draft.length]);

  const handleBlur = () => {
    if (isEditing) {
      onSave(draft.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTitle) return; // allow newlines in description
    if (e.key === 'Enter' && isTitle) handleBlur();
    if (e.key === 'Escape') { setDraft(value); setIsEditing(false); }
  };

  if (!isEditing) {
    return (
      <div 
        onClick={startEditing}
        className={cn(
          'min-h-[2.5rem] cursor-text transition-colors flex items-center',
          isTitle ? (titleClassName || 'text-lg font-medium') : 'text-sm text-gray-500 whitespace-pre-wrap',
          value ? '' : 'text-gray-300 italic'
        )}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && startEditing()}
        role="button"
        aria-label={value ? `Edit ${isTitle ? 'title' : 'description'}` : `Add ${isTitle ? 'title' : 'description'}`}
      >
        {value || placeholder}
      </div>
    );
  }

  if (isTitle) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white border border-[#EC8601]/30 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#EC8601]/20",
          titleClassName,
        )}
        autoFocus={autoFocus}
        aria-label="Edit title"
      />
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full bg-white border border-[#EC8601]/30 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#EC8601]/20 min-h-[4rem] resize-y"
      autoFocus={autoFocus}
      aria-label="Edit description"
    />
  );
}
