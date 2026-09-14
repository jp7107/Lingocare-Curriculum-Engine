import { CurriculumNode } from '@/types/curriculum';

function markEdited(node: CurriculumNode): CurriculumNode {
  // If the node was AI-generated (source/inferred), mark as edited when user changes it
  const origin = (node.origin === 'source' || node.origin === 'inferred') ? 'edited' as const : node.origin;
  return { ...node, origin, updatedAt: Date.now() };
}

export function updateNodeTitle(tree: CurriculumNode, id: string, title: string): CurriculumNode {
  if (tree.id === id) return { ...markEdited(tree), title };
  return { ...tree, children: tree.children.map(c => updateNodeTitle(c, id, title)) };
}

export function updateNodeDescription(tree: CurriculumNode, id: string, description: string): CurriculumNode {
  if (tree.id === id) return { ...markEdited(tree), description };
  return { ...tree, children: tree.children.map(c => updateNodeDescription(c, id, description)) };
}

export function addChild(tree: CurriculumNode, parentId: string, child: CurriculumNode): CurriculumNode {
  if (tree.id === parentId) {
    return { ...tree, children: [...tree.children, child], updatedAt: Date.now() };
  }
  return { ...tree, children: tree.children.map(c => addChild(c, parentId, child)) };
}

export function deleteNode(tree: CurriculumNode, id: string): CurriculumNode | null {
  if (tree.id === id) return null; // signal to parent to filter out
  const newChildren = tree.children.map(c => deleteNode(c, id)).filter(Boolean) as CurriculumNode[];
  return { ...tree, children: newChildren, updatedAt: Date.now() };
}

export function toggleExpand(tree: CurriculumNode, id: string): CurriculumNode {
  if (tree.id === id) return { ...tree, isExpanded: !tree.isExpanded };
  return { ...tree, children: tree.children.map(c => toggleExpand(c, id)) };
}

export function expandAll(tree: CurriculumNode): CurriculumNode {
  return { ...tree, isExpanded: true, children: tree.children.map(c => expandAll(c)) };
}

export function collapseAll(tree: CurriculumNode): CurriculumNode {
  // Keep curriculum root expanded, collapse everything else
  return {
    ...tree,
    isExpanded: tree.level === 'curriculum',
    children: tree.children.map(c => collapseAll(c)),
  };
}

export function findNode(tree: CurriculumNode, id: string): CurriculumNode | null {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}
