'use client';

import React from 'react';
import { CurriculumNode, countChildren, countByOrigin } from '@/types/curriculum';

interface AiReviewPanelProps {
  curriculum: CurriculumNode;
  fileName: string;
  onImport: () => void;
  onCancel: () => void;
}

export function AiReviewPanel({ curriculum, fileName, onImport, onCancel }: AiReviewPanelProps) {
  const moduleCount = curriculum.children.length;
  const { topics, lessons } = countChildren(curriculum);
  const { source, inferred } = countByOrigin(curriculum);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-1">AI-Generated Curriculum</h2>
          <p className="text-sm text-gray-500 mb-6">
            from <span className="font-medium text-gray-700">{fileName}</span>
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-3 mb-6 text-sm">
            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
              {moduleCount} module{moduleCount !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-300">·</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
              {topics} topic{topics !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-300">·</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
              {lessons} lesson{lessons !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Origin breakdown */}
          <div className="flex items-center justify-center gap-4 mb-8 text-sm">
            {source > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-600">{source} from document</span>
              </span>
            )}
            {inferred > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-600">{inferred} AI inferred</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onImport}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#EC8601] hover:bg-[#d47801] rounded-xl transition-colors shadow-sm"
            >
              Import into editor
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            All items will be fully editable after import
          </p>
        </div>
      </div>
    </div>
  );
}
