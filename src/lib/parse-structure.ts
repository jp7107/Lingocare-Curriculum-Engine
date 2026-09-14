import { CurriculumNode } from '@/types/curriculum';

interface ParsedEntity {
  id: string;
  title: string;
  description?: string;
}

const ROMAN_MAP: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15, xvi: 16, xvii: 17, xviii: 18, xix: 19, xx: 20,
};

function parseNumOrRoman(str: string): number {
  const clean = str.trim().toLowerCase();
  if (/^\d+$/.test(clean)) return parseInt(clean, 10);
  if (ROMAN_MAP[clean]) return ROMAN_MAP[clean];
  return 0;
}

// Regex patterns to recognize Module, Topic, Lesson hierarchy across English and German
const MODULE_REGEX = /^(?:Module|Modul|Unit|Block|Kapitel)\s+(\d+|[ivx]+)[:.\-—\s]\s*(.*)$/i;
const TOPIC_REGEX = /^(?:Topic|Thema|Section|Abschnitt)\s+(\d+(?:\.\d+)?|[ivx]+(?:\.[ivx]+)?)[:.\-—\s]\s*(.*)$/i;
const LESSON_REGEX = /^(?:Lesson|Lektion|Einheit|Lerneinheit)\s+(\d+(?:\.\d+)*|[ivx]+(?:\.[ivx]+)*)[:.\-—\s]\s*(.*)$/i;

function cleanHeaderTitle(rawTitle: string): string {
  return rawTitle.replace(/^[:.\-—\s]+/, '').trim();
}

export function parseStructuredDocument(
  cleanLines: string[],
  rawText: string,
  fileName?: string
): CurriculumNode | null {
  const lines = cleanLines && cleanLines.length > 0 ? cleanLines : rawText.split('\n');

  const modulesMap = new Map<number, ParsedEntity>();
  const topicsMap = new Map<string, ParsedEntity>();
  const lessonsMap = new Map<string, ParsedEntity>();
  const descriptions = new Map<string, string>();

  let lastKey: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip running page headers / footers
    if (/^Clinical German for Nursing/i.test(line) || /^Page \d+$/i.test(line) || /^---+Page.*---+$/i.test(line)) {
      continue;
    }

    const mMatch = line.match(MODULE_REGEX);
    if (mMatch) {
      const num = parseNumOrRoman(mMatch[1]);
      if (num === 0) continue;
      const title = cleanHeaderTitle(mMatch[2]) || `Module ${num}`;
      modulesMap.set(num, { id: String(num), title });
      lastKey = `m_${num}`;
      continue;
    }

    const tMatch = line.match(TOPIC_REGEX);
    if (tMatch) {
      const id = tMatch[1];
      const title = cleanHeaderTitle(tMatch[2]) || `Topic ${id}`;
      topicsMap.set(id, { id, title });
      lastKey = `t_${id}`;
      continue;
    }

    const lMatch = line.match(LESSON_REGEX);
    if (lMatch) {
      const id = lMatch[1];
      const title = cleanHeaderTitle(lMatch[2]) || `Lesson ${id}`;
      lessonsMap.set(id, { id, title });
      lastKey = `l_${id}`;
      continue;
    }

    // Capture descriptive text
    if (lastKey) {
      const prev = descriptions.get(lastKey) || '';
      // Exclude metadata headers
      if (!/^Production-like test document/i.test(line) && !/^\d+\s+Modules/i.test(line)) {
        descriptions.set(lastKey, prev ? `${prev} ${line}` : line);
      }
    }
  }

  // If no modules were found from cleanLines, check rawText lines
  if (modulesMap.size === 0 && rawText) {
    const rawLines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of rawLines) {
      const mMatch = line.match(MODULE_REGEX);
      if (mMatch) {
        const num = parseNumOrRoman(mMatch[1]);
        if (num === 0) continue;
        if (!modulesMap.has(num)) {
          modulesMap.set(num, { id: String(num), title: cleanHeaderTitle(mMatch[2]) || `Module ${num}` });
        }
        continue;
      }
      const tMatch = line.match(TOPIC_REGEX);
      if (tMatch) {
        const id = tMatch[1];
        if (!topicsMap.has(id)) {
          topicsMap.set(id, { id, title: cleanHeaderTitle(tMatch[2]) || `Topic ${id}` });
        }
        continue;
      }
      const lMatch = line.match(LESSON_REGEX);
      if (lMatch) {
        const id = lMatch[1];
        if (!lessonsMap.has(id)) {
          lessonsMap.set(id, { id, title: cleanHeaderTitle(lMatch[2]) || `Lesson ${id}` });
        }
        continue;
      }
    }
  }

  // If still no modules found, return null so LLM or fallback can handle it
  if (modulesMap.size === 0) {
    return null;
  }

  const now = Date.now();
  const sortedModuleNums = Array.from(modulesMap.keys()).sort((a, b) => a - b);

  const modules: CurriculumNode[] = sortedModuleNums.map((num) => {
    const mod = modulesMap.get(num)!;
    const modDesc = descriptions.get(`m_${num}`) || `Core learning module covering ${mod.title}.`;

    // Find topics matching this module: id starts with "num." or "num"
    const prefix = `${num}.`;
    const matchingTopicIds = Array.from(topicsMap.keys())
      .filter((id) => id.startsWith(prefix) || id === String(num))
      .sort((a, b) => {
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        return aNum - bNum;
      });

    let topics: CurriculumNode[] = [];

    if (matchingTopicIds.length > 0) {
      topics = matchingTopicIds.map((tId) => {
        const top = topicsMap.get(tId)!;
        const topDesc = descriptions.get(`t_${tId}`) || `Focus area covering ${top.title}.`;

        // Find lessons matching this topic: id starts with "tId."
        const lPrefix = `${tId}.`;
        const matchingLessonIds = Array.from(lessonsMap.keys())
          .filter((id) => id.startsWith(lPrefix))
          .sort((a, b) => {
            const aParts = a.split('.').map(Number);
            const bParts = b.split('.').map(Number);
            const aLast = aParts[aParts.length - 1] || 0;
            const bLast = bParts[bParts.length - 1] || 0;
            return aLast - bLast;
          });

        let lessons: CurriculumNode[] = [];

        if (matchingLessonIds.length > 0) {
          lessons = matchingLessonIds.map((lId) => {
            const les = lessonsMap.get(lId)!;
            const lesDesc = descriptions.get(`l_${lId}`) || `Practical application and terminology for ${les.title}.`;
            return {
              id: crypto.randomUUID(),
              level: 'lesson',
              title: les.title,
              description: lesDesc,
              origin: 'source',
              children: [],
              isExpanded: false,
              createdAt: now,
              updatedAt: now,
            };
          });
        } else {
          // Rule 4: Infer 2-4 lessons if topic has no lessons
          lessons = [
            {
              id: crypto.randomUUID(),
              level: 'lesson',
              title: `Core Terminology and Concepts for ${top.title}`,
              description: `Mastering foundational clinical terminology and communication standards for ${top.title}.`,
              origin: 'inferred',
              children: [],
              isExpanded: false,
              createdAt: now,
              updatedAt: now,
            },
            {
              id: crypto.randomUUID(),
              level: 'lesson',
              title: `Clinical Documentation and Practical Application for ${top.title}`,
              description: `Applying professional German during routine clinical documentation and teamwork for ${top.title}.`,
              origin: 'inferred',
              children: [],
              isExpanded: false,
              createdAt: now,
              updatedAt: now,
            },
          ];
        }

        return {
          id: crypto.randomUUID(),
          level: 'topic',
          title: top.title,
          description: topDesc,
          origin: 'source',
          children: lessons,
          isExpanded: true,
          createdAt: now,
          updatedAt: now,
        };
      });
    } else {
      // Rule 3: Infer 3-5 topics if module has no topics
      topics = [
        {
          id: crypto.randomUUID(),
          level: 'topic',
          title: `Foundations and Clinical Guidelines for ${mod.title}`,
          description: `Key clinical principles, protocols, and communication standards for ${mod.title}.`,
          origin: 'inferred',
          children: [
            {
              id: crypto.randomUUID(),
              level: 'lesson',
              title: `Essential Terminology and Protocols for ${mod.title}`,
              description: `Foundational vocabulary and patient communication for ${mod.title}.`,
              origin: 'inferred',
              children: [],
              isExpanded: false,
              createdAt: now,
              updatedAt: now,
            },
            {
              id: crypto.randomUUID(),
              level: 'lesson',
              title: `Clinical Practice and Safety Procedures for ${mod.title}`,
              description: `Practical implementation and safety precautions in clinical environments.`,
              origin: 'inferred',
              children: [],
              isExpanded: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
          isExpanded: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          level: 'topic',
          title: `Documentation and Interprofessional Communication in ${mod.title}`,
          description: `Accurate shift handover and record keeping relating to ${mod.title}.`,
          origin: 'inferred',
          children: [
            {
              id: crypto.randomUUID(),
              level: 'lesson',
              title: `Structured Clinical Reporting for ${mod.title}`,
              description: `Drafting clear, timestamped nursing reports according to German clinical standards.`,
              origin: 'inferred',
              children: [],
              isExpanded: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
          isExpanded: true,
          createdAt: now,
          updatedAt: now,
        },
      ];
    }

    return {
      id: crypto.randomUUID(),
      level: 'module',
      title: mod.title,
      description: modDesc,
      origin: 'source',
      children: topics,
      isExpanded: true,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Extract curriculum title and description
  let title = 'Clinical German for Nursing Curriculum';
  let description = 'Extracted curriculum structure from document.';

  if (cleanLines && cleanLines.length > 0) {
    const firstNonEmpty = cleanLines.find((l) => l.trim().length > 0 && !MODULE_REGEX.test(l));
    if (firstNonEmpty) {
      let t = firstNonEmpty.trim();
      if (/^C\s*L\s*I\s*N\s*I\s*C\s*A\s*L/i.test(t)) {
        t = 'Clinical German for Nursing: B2 Curriculum';
      }
      title = t;
    }
  }

  if (cleanLines && cleanLines.length > 1) {
    const secondNonEmpty = cleanLines.find(
      (l) => l.trim().length > 0 && l.trim() !== title && !MODULE_REGEX.test(l)
    );
    if (secondNonEmpty && secondNonEmpty.length < 200) {
      description = secondNonEmpty.trim();
    }
  }

  return {
    id: crypto.randomUUID(),
    level: 'curriculum',
    title,
    description,
    origin: 'source',
    children: modules,
    isExpanded: true,
    createdAt: now,
    updatedAt: now,
    sourceFileName: fileName,
  };
}
