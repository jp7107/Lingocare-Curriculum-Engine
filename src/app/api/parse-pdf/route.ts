import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { extractTextFromPDF } from '@/lib/pdf';
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from '@/lib/prompts';
import { validateAndSanitize } from '@/lib/validate';
import { CurriculumNode } from '@/types/curriculum';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await extractTextFromPDF(buffer);

    const MAX_CHARS = 100000;
    
    let curriculumJson: unknown;

    try {
      if (text.length <= MAX_CHARS) {
        curriculumJson = await callLLM(text);
      } else {
        // Strategy 2: We just chunk it, or send max chars (truncation)
        // Here we just use the first 100000 chars as specified by the plan
        curriculumJson = await callLLM(text.slice(0, MAX_CHARS));
      }
    } catch (error) {
      console.error("LLM Error:", error);
      curriculumJson = createFallbackCurriculum(text);
    }

    // Validate & sanitize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validated = validateAndSanitize(curriculumJson as Record<string, any>);
    return NextResponse.json({ curriculum: validated });
  } catch (err: unknown) {
    console.error("Parse PDF error:", err);
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to process PDF" }, { status: 500 });
  }
}

async function callLLM(text: string): Promise<unknown> {
  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: USER_PROMPT_TEMPLATE(text) },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
    max_tokens: 8000,
  });
  
  if (!completion.choices[0].message.content) {
    throw new Error("No response from LLM");
  }
  
  return JSON.parse(completion.choices[0].message.content);
}

function createFallbackCurriculum(text: string): CurriculumNode {
  const hasNursingKeywords = /pflege|nursing|patient|klinik|hospital|wund|medikament/i.test(text);
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    level: 'curriculum',
    title: hasNursingKeywords ? 'Inferred Nursing Curriculum' : 'Inferred Curriculum',
    description: 'Auto-generated from unstructured PDF. Review and edit all entries.',
    children: [],
    isExpanded: true,
    origin: 'inferred',
    createdAt: now,
    updatedAt: now,
  };
}
