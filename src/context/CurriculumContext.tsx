'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CurriculumNode, createEmptyCurriculum } from '@/types/curriculum';
import {
  updateNodeTitle,
  updateNodeDescription,
  addChild,
  deleteNode,
  toggleExpand,
  expandAll,
  collapseAll,
} from '@/utils/treeMutations';

const STORAGE_KEY = 'lingocare-curriculum-draft';

interface CurriculumState {
  root: CurriculumNode;
  selectedNodeId: string | null;
  undoSnapshot: CurriculumNode | null; // for undo after delete
  deletedItemLabel: string | null;     // "Module", "Topic", etc.
}

type Action =
  | { type: 'UPDATE_TITLE'; id: string; title: string }
  | { type: 'UPDATE_DESCRIPTION'; id: string; description: string }
  | { type: 'ADD_CHILD'; parentId: string; child: CurriculumNode }
  | { type: 'DELETE_NODE'; id: string; level: string }
  | { type: 'UNDO_DELETE' }
  | { type: 'CLEAR_UNDO' }
  | { type: 'TOGGLE_EXPAND'; id: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'REPLACE_TREE'; root: CurriculumNode }
  | { type: 'RESET_TREE' }
  | { type: 'SET_SELECTED'; id: string | null };

function loadFromStorage(): CurriculumNode | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveToStorage(root: CurriculumNode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  } catch {
    // Ignore storage quota errors
  }
}

const initialState: CurriculumState = {
  root: createEmptyCurriculum(),
  selectedNodeId: null,
  undoSnapshot: null,
  deletedItemLabel: null,
};

function curriculumReducer(state: CurriculumState, action: Action): CurriculumState {
  switch (action.type) {
    case 'UPDATE_TITLE':
      return { ...state, root: updateNodeTitle(state.root, action.id, action.title) };
    case 'UPDATE_DESCRIPTION':
      return { ...state, root: updateNodeDescription(state.root, action.id, action.description) };
    case 'ADD_CHILD':
      return { ...state, root: addChild(state.root, action.parentId, action.child) };
    case 'DELETE_NODE': {
      const snapshot = state.root; // Save current state for undo
      const newRoot = deleteNode(state.root, action.id);
      return {
        ...state,
        root: newRoot || createEmptyCurriculum(),
        undoSnapshot: snapshot,
        deletedItemLabel: action.level,
      };
    }
    case 'UNDO_DELETE':
      if (state.undoSnapshot) {
        return { ...state, root: state.undoSnapshot, undoSnapshot: null, deletedItemLabel: null };
      }
      return state;
    case 'CLEAR_UNDO':
      return { ...state, undoSnapshot: null, deletedItemLabel: null };
    case 'TOGGLE_EXPAND':
      return { ...state, root: toggleExpand(state.root, action.id) };
    case 'EXPAND_ALL':
      return { ...state, root: expandAll(state.root) };
    case 'COLLAPSE_ALL':
      return { ...state, root: collapseAll(state.root) };
    case 'REPLACE_TREE':
      return { ...state, root: action.root, undoSnapshot: null, deletedItemLabel: null };
    case 'RESET_TREE':
      return {
        ...state,
        root: createEmptyCurriculum(),
        undoSnapshot: state.root,
        deletedItemLabel: 'Curriculum',
      };
    case 'SET_SELECTED':
      return { ...state, selectedNodeId: action.id };
    default:
      return state;
  }
}

interface CurriculumContextType {
  state: CurriculumState;
  dispatch: React.Dispatch<Action>;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export function CurriculumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(curriculumReducer, initialState);
  const isHydrated = React.useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'REPLACE_TREE', root: saved });
    }
    isHydrated.current = true;
  }, []);

  // Save to localStorage on every change (after hydration)
  useEffect(() => {
    if (isHydrated.current) {
      saveToStorage(state.root);
    }
  }, [state.root]);

  return (
    <CurriculumContext.Provider value={{ state, dispatch }}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum() {
  const context = useContext(CurriculumContext);
  if (context === undefined) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
}

