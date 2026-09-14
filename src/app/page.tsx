'use client';

import React, { useState, useCallback } from 'react';
import { CurriculumProvider, useCurriculum } from '@/context/CurriculumContext';
import { NodeRenderer } from '@/components/NodeRenderer';
import { Toast } from '@/components/Toast';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { AiReviewPanel } from '@/components/AiReviewPanel';
import {
  DocumentArrowUpIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CurriculumNode } from '@/types/curriculum';

function CurriculumTree() {
  const { state } = useCurriculum();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <NodeRenderer node={state.root} depth={0} />
      </div>

      {/* Local draft indicator */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Local draft · saved in your browser
      </p>

      {/* Keyboard shortcut hint */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-1.5">
        <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-500">Tab</kbd>
        <span>navigate</span>
        <span className="text-gray-300">·</span>
        <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-500">Enter</kbd>
        <span>edit</span>
        <span className="text-gray-300">·</span>
        <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-500">Esc</kbd>
        <span>cancel</span>
      </p>
    </div>
  );
}

function UndoToast() {
  const { state, dispatch } = useCurriculum();

  if (!state.undoSnapshot || !state.deletedItemLabel) return null;

  return (
    <Toast
      message={`${state.deletedItemLabel} deleted`}
      onUndo={() => dispatch({ type: 'UNDO_DELETE' })}
      onDismiss={() => dispatch({ type: 'CLEAR_UNDO' })}
    />
  );
}

function Toolbar() {
  const { dispatch } = useCurriculum();
  const [isUploading, setIsUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [pendingCurriculum, setPendingCurriculum] = useState<CurriculumNode | null>(null);
  const [pendingFileName, setPendingFileName] = useState('');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProcessingStep(0); // Uploading

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProcessingStep(1); // Extracting

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      setProcessingStep(2); // Understanding structure

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF');
      }

      setProcessingStep(3); // Validating

      // Brief pause to show validation step
      await new Promise(r => setTimeout(r, 500));

      // Show review panel instead of immediately replacing
      setPendingCurriculum(data.curriculum as CurriculumNode);
      setPendingFileName(file.name);

    } catch (err: unknown) {
      const error = err as Error;
      const message = error.message || 'An error occurred';
      // Map technical errors to user-friendly messages
      if (message.includes('Failed to extract') || message.includes('pdf')) {
        setError("We couldn't read this PDF. Please try a different file.");
      } else if (message.includes('Failed to parse') || message.includes('LLM') || message.includes('No response')) {
        setError("We couldn't generate a curriculum from this document. Please try again.");
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Network')) {
        setError("Connection error. Please check your internet and try again.");
      } else {
        setError("Something went wrong. Your existing curriculum is unchanged.");
      }
      console.error('PDF upload error:', err);
    } finally {
      setIsUploading(false);
      setProcessingStep(-1);
      e.target.value = '';
    }
  }, []);

  const handleImport = useCallback(() => {
    if (pendingCurriculum) {
      dispatch({ type: 'REPLACE_TREE', root: pendingCurriculum });
      setPendingCurriculum(null);
      setPendingFileName('');
    }
  }, [pendingCurriculum, dispatch]);

  const handleCancelReview = useCallback(() => {
    setPendingCurriculum(null);
    setPendingFileName('');
  }, []);

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Lingocare Logo" width={32} height={32} className="h-8 w-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Lingocare Curriculum Engine</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand/Collapse all */}
            <button
              onClick={() => dispatch({ type: 'EXPAND_ALL' })}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Expand all"
              aria-label="Expand all"
            >
              <ChevronDoubleDownIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch({ type: 'COLLAPSE_ALL' })}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Collapse all"
              aria-label="Collapse all"
            >
              <ChevronDoubleUpIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Start a new blank curriculum? Your current draft will be reset (you can undo this).')) {
                  dispatch({ type: 'RESET_TREE' });
                }
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-1 text-xs"
              title="Start a new blank curriculum"
              aria-label="New curriculum"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Reset</span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Error display */}
            {error && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-500 max-w-xs truncate">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload button */}
            <label className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer",
              isUploading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#EC8601]/10 text-[#EC8601] hover:bg-[#EC8601]/20 border border-[#EC8601]/25"
            )}>
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <DocumentArrowUpIcon className="w-4 h-4" />
              )}
              {isUploading ? 'Processing...' : 'Generate from PDF'}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Processing overlay */}
      {isUploading && processingStep >= 0 && (
        <ProcessingOverlay currentStep={processingStep} />
      )}

      {/* AI Review panel */}
      {pendingCurriculum && (
        <AiReviewPanel
          curriculum={pendingCurriculum}
          fileName={pendingFileName}
          onImport={handleImport}
          onCancel={handleCancelReview}
        />
      )}
    </>
  );
}

export default function CurriculumPage() {
  return (
    <CurriculumProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Toolbar />
        <CurriculumPageContent />
        <UndoToast />
      </div>
    </CurriculumProvider>
  );
}

function CurriculumPageContent() {
  return <CurriculumTree />;
}

