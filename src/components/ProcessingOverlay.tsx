'use client';

import React from 'react';

interface ProcessingStep {
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface ProcessingOverlayProps {
  currentStep: number; // 0-3
}

const STEPS = [
  'Uploading document',
  'Extracting text',
  'Understanding curriculum structure',
  'Validating & preparing',
];

export function ProcessingOverlay({ currentStep }: ProcessingOverlayProps) {
  const steps: ProcessingStep[] = STEPS.map((label, i) => ({
    label,
    status: i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending',
  }));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EC8601]/10 rounded-xl mb-3">
            <svg className="w-6 h-6 text-[#EC8601] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Generating Curriculum</h3>
          <p className="text-sm text-gray-500 mt-1">AI is analyzing your document…</p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {step.status === 'done' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {step.status === 'active' && (
                <div className="w-5 h-5 rounded-full border-2 border-[#EC8601] flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#EC8601] animate-pulse" />
                </div>
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                step.status === 'done' ? 'text-gray-500' :
                step.status === 'active' ? 'text-gray-900 font-medium' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
