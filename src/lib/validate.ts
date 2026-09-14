import { CurriculumNode, NodeLevel, NodeOrigin, CHILD_LEVEL } from '@/types/curriculum';
import { capitalize } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateAndSanitize(node: Record<string, any>, parentLevel: NodeLevel | null = null): CurriculumNode {
  // Generate ID if missing/invalid
  const id = (typeof node.id === 'string' && node.id.match(/^[0-9a-f-]{36}$/i)) 
    ? node.id : crypto.randomUUID();

  // Validate level
  const validLevels: NodeLevel[] = ['curriculum', 'module', 'topic', 'lesson'];
  const level = validLevels.includes(node.level) ? node.level : inferLevel(parentLevel);

  // Enforce hierarchy rules
  const expectedLevel = parentLevel ? CHILD_LEVEL[parentLevel] : 'curriculum';
  const finalLevel = (level === expectedLevel) ? level : (expectedLevel || 'lesson');

  // Validate origin
  const validOrigins: NodeOrigin[] = ['source', 'inferred', 'manual', 'edited'];
  const origin: NodeOrigin = validOrigins.includes(node.origin) ? node.origin : 'inferred';

  // Sanitize strings
  const title = String(node.title || '').trim().slice(0, 200) || `Untitled ${capitalize(finalLevel)}`;
  const description = String(node.description || '').trim().slice(0, 1000);

  // Recurse children
  const rawChildren = Array.isArray(node.children) ? node.children : [];
  const maxChildren = finalLevel === 'lesson' ? 0 : 50; // safety cap
  const children = rawChildren
    .slice(0, maxChildren)
    .map((child: Record<string, unknown>) => validateAndSanitize(child as Record<string, string | unknown[]>, finalLevel))
    .filter((child: CurriculumNode | null) => child !== null) as CurriculumNode[];

  // Lessons must have empty children
  const finalChildren = finalLevel === 'lesson' ? [] : children;

  return {
    id,
    level: finalLevel,
    title,
    description,
    children: finalChildren,
    isExpanded: finalLevel !== 'lesson',
    origin,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function inferLevel(parentLevel: NodeLevel | null): NodeLevel {
  if (!parentLevel) return 'curriculum';
  return CHILD_LEVEL[parentLevel] || 'lesson';
}
