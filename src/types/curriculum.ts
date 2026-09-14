export type NodeLevel = 'curriculum' | 'module' | 'topic' | 'lesson';
export type NodeOrigin = 'manual' | 'source' | 'inferred' | 'edited';

export interface CurriculumNode {
  id: string;                    // UUID v4
  level: NodeLevel;
  title: string;
  description: string;
  children: CurriculumNode[];    // empty array for lessons
  isExpanded: boolean;           // UI state, not persisted
  origin: NodeOrigin;            // tracks provenance
  createdAt: number;             // timestamp for ordering
  updatedAt: number;
  sourceFileName?: string;       // only on root, tracks PDF filename
}

// Valid child levels per parent
export const CHILD_LEVEL: Record<NodeLevel, NodeLevel | null> = {
  curriculum: 'module',
  module: 'topic',
  topic: 'lesson',
  lesson: null,
};

// Factory functions
export function createNode(level: NodeLevel, title = '', description = '', origin: NodeOrigin = 'manual'): CurriculumNode {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    level,
    title,
    description,
    children: [],
    isExpanded: level !== 'lesson', // curriculum/module/topic expanded by default
    origin,
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyCurriculum(): CurriculumNode {
  return createNode('curriculum', 'Untitled Curriculum', '');
}

// Type guards for runtime safety
export function canHaveChildren(node: CurriculumNode): boolean {
  return CHILD_LEVEL[node.level] !== null;
}

export function getChildLevel(parentLevel: NodeLevel): NodeLevel | null {
  return CHILD_LEVEL[parentLevel];
}

// Count helpers for collapsed summaries
export function countChildren(node: CurriculumNode): { topics: number; lessons: number } {
  let topics = 0;
  let lessons = 0;
  for (const child of node.children) {
    if (child.level === 'topic') topics++;
    if (child.level === 'lesson') lessons++;
    const sub = countChildren(child);
    topics += sub.topics;
    lessons += sub.lessons;
  }
  return { topics, lessons };
}

export function countByOrigin(node: CurriculumNode): { source: number; inferred: number } {
  let source = 0;
  let inferred = 0;
  if (node.origin === 'source') source++;
  if (node.origin === 'inferred') inferred++;
  for (const child of node.children) {
    const sub = countByOrigin(child);
    source += sub.source;
    inferred += sub.inferred;
  }
  return { source, inferred };
}
