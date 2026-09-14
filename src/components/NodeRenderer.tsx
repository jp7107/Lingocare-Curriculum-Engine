'use client';

import React from 'react';
import { CurriculumNode, canHaveChildren, getChildLevel, countChildren } from '@/types/curriculum';
import { useCurriculum } from '@/context/CurriculumContext';
import { InlineEdit } from './InlineEdit';
import { OriginBadge } from './OriginBadge';
import { createNode } from '@/types/curriculum';
import { ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn, capitalize } from '@/lib/utils';

interface NodeRendererProps {
  node: CurriculumNode;
  depth: number;
  index?: number;       // position among siblings (for numbering)
  parentIndex?: string; // parent's index string for nested numbering (e.g. "1")
}

// Level-specific styling
const LEVEL_STYLES = {
  curriculum: {
    title: 'text-2xl font-bold text-gray-900',
    container: '',
    accent: '',
    descPlaceholder: 'Click to Add Description ✧',
  },
  module: {
    title: 'text-lg font-semibold text-gray-900',
    container: 'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm',
    accent: 'border-l-[3px] border-l-[#EC8601]',
    descPlaceholder: 'Click to Add Description ✧',
  },
  topic: {
    title: 'text-base font-medium text-gray-800',
    container: 'bg-gray-50/70 border border-gray-150 rounded-xl p-4',
    accent: 'border-l-[3px] border-l-[#EC8601]/40',
    descPlaceholder: 'Click to Add Description ✧',
  },
  lesson: {
    title: 'text-sm font-normal text-gray-700',
    container: '',
    accent: '',
    descPlaceholder: 'Click to Add Description ✧',
  },
};

export function NodeRenderer({ node, depth, index = 0, parentIndex }: NodeRendererProps) {
  const { dispatch } = useCurriculum();
  const childLevel = getChildLevel(node.level);
  const isRoot = node.level === 'curriculum';
  const styles = LEVEL_STYLES[node.level];

  // Build numbering string: "MODULE 1", "Topic 1", "Lesson 1.1"
  const getNumberLabel = (): string => {
    if (isRoot) return '';
    const num = index + 1;
    if (node.level === 'module') return `MODULE ${num} — `;
    if (node.level === 'topic') return `Topic ${num} — `;
    if (node.level === 'lesson') {
      const prefix = parentIndex || '';
      return `Lesson ${prefix}${prefix ? '.' : ''}${num} – `;
    }
    return '';
  };

  // Current numbering for passing to children
  const currentIndex = (): string => {
    if (isRoot) return '';
    const num = index + 1;
    if (node.level === 'module') return `${num}`;
    if (node.level === 'topic') return `${parentIndex || ''}${parentIndex ? '.' : ''}${num}`;
    return '';
  };

  const handleAddChild = () => {
    if (!childLevel) return;
    const child = createNode(childLevel, '', '');
    dispatch({ type: 'ADD_CHILD', parentId: node.id, child });
    if (!node.isExpanded) {
      dispatch({ type: 'TOGGLE_EXPAND', id: node.id });
    }
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_NODE', id: node.id, level: capitalize(node.level) });
  };

  const handleToggleExpand = () => dispatch({ type: 'TOGGLE_EXPAND', id: node.id });

  // Collapsed summary for modules/topics
  const collapsedSummary = !node.isExpanded && canHaveChildren(node) && node.children.length > 0
    ? countChildren(node)
    : null;

  const numberLabel = getNumberLabel();

  return (
    <div className={cn(
      'relative group/node',
      styles.container,
      styles.accent,
      // Top-level spacing between modules
      depth === 1 && 'mt-0',
    )}>
      {/* Header row */}
      <div className="flex items-start gap-2">
        {/* Expand chevron */}
        {canHaveChildren(node) ? (
          <button
            onClick={handleToggleExpand}
            className={cn(
              'flex-shrink-0 text-gray-400 hover:text-[#EC8601] transition-transform duration-200',
              isRoot ? 'mt-3' : node.level === 'module' ? 'mt-1.5' : 'mt-1',
              node.isExpanded && 'rotate-90'
            )}
            aria-expanded={node.isExpanded}
            aria-label={node.isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRightIcon className={cn(isRoot ? 'w-5 h-5' : 'w-4 h-4')} />
          </button>
        ) : (
          <div className={cn('flex-shrink-0', isRoot ? 'w-5 h-5 mt-3' : 'w-4 h-4 mt-1')} />
        )}

        {/* Title + Description + Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-0 flex items-baseline gap-0">
              {/* Number prefix */}
              {numberLabel && (
                <span className={cn(
                  'flex-shrink-0 whitespace-nowrap',
                  node.level === 'module' ? 'text-xs font-bold text-[#EC8601] uppercase tracking-wide mr-1.5' :
                  node.level === 'topic' ? 'text-xs font-semibold text-gray-500 mr-1.5' :
                  'text-xs font-medium text-gray-400 mr-1'
                )}>
                  {numberLabel}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <InlineEdit
                  value={node.title}
                  onSave={title => dispatch({ type: 'UPDATE_TITLE', id: node.id, title })}
                  placeholder={isRoot ? 'Curriculum title' : `Untitled ${capitalize(node.level)}`}
                  isTitle
                  titleClassName={styles.title}
                />
              </div>
            </div>

            {/* Origin badge */}
            <OriginBadge origin={node.origin} />

            {/* Delete button — always visible for non-root */}
            {!isRoot && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                aria-label={`Delete ${node.level}`}
                title={`Delete ${node.level}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}

            {/* Collapsed summary */}
            {collapsedSummary && (
              <span className="text-xs text-gray-400 flex-shrink-0">
                {collapsedSummary.topics > 0 && `${collapsedSummary.topics} topic${collapsedSummary.topics !== 1 ? 's' : ''}`}
                {collapsedSummary.topics > 0 && collapsedSummary.lessons > 0 && ' · '}
                {collapsedSummary.lessons > 0 && `${collapsedSummary.lessons} lesson${collapsedSummary.lessons !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-1">
            <InlineEdit
              value={node.description}
              onSave={description => dispatch({ type: 'UPDATE_DESCRIPTION', id: node.id, description })}
              placeholder={styles.descPlaceholder}
            />
          </div>
        </div>
      </div>

      {/* Children */}
      {canHaveChildren(node) && node.isExpanded && node.children.length > 0 && (
        <div
          className={cn(
            'space-y-3',
            isRoot ? 'mt-6' : 'mt-4',
            // Indent only lessons inside topics (topics/modules are cards)
            node.level === 'topic' && 'ml-2'
          )}
          role="list"
          aria-label={`${node.level} children`}
        >
          {node.children.map((child, i) => (
            <NodeRenderer
              key={child.id}
              node={child}
              depth={depth + 1}
              index={i}
              parentIndex={currentIndex()}
            />
          ))}
        </div>
      )}

      {/* Always-visible pill-style add button */}
      {canHaveChildren(node) && node.isExpanded && (
        <div className={cn(isRoot ? 'mt-4' : 'mt-3')}>
          <button
            onClick={handleAddChild}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition-all rounded-full',
              'border border-dashed',
              node.children.length === 0
                ? 'w-full py-3 justify-center border-gray-300 text-gray-400 hover:border-[#EC8601]/50 hover:text-[#EC8601] hover:bg-[#EC8601]/5'
                : 'px-4 py-1.5 border-gray-300 text-gray-400 hover:border-[#EC8601]/50 hover:text-[#EC8601] hover:bg-[#EC8601]/5'
            )}
          >
            <span className="text-base leading-none">+</span>
            Add {capitalize(childLevel!)}
          </button>
        </div>
      )}
    </div>
  );
}

