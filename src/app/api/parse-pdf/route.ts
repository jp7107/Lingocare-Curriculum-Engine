import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { extractPdfDetails } from '@/lib/pdf';
import { parseStructuredDocument } from '@/lib/parse-structure';
import { createFallbackCurriculum } from '@/lib/fallback';
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from '@/lib/prompts';
import { validateAndSanitize } from '@/lib/validate';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { cleanLines, rawText, cleanText } = await extractPdfDetails(buffer);

    // Tier 1: High-fidelity structured parsing for documents with explicit hierarchy
    const structuredResult = parseStructuredDocument(cleanLines, rawText, file.name);

    if (structuredResult && structuredResult.children.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validated = validateAndSanitize(structuredResult as Record<string, any>);
      return NextResponse.json({ curriculum: validated });
    }

    // Tier 2: LLM parsing for unstructured or freeform documents
    let curriculumJson: unknown;
    const textToParse = (cleanText && cleanText.length > 50 ? cleanText : rawText).trim();

    try {
      // Limit text to 15,000 chars (~3,500 tokens) to guarantee staying well within Groq TPM limits
      curriculumJson = await callLLM(textToParse.slice(0, 15000));
    } catch (error) {
      console.error('LLM Error, utilizing intelligent fallback:', error);
      curriculumJson = createFallbackCurriculum(textToParse, file.name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validated = validateAndSanitize(curriculumJson as Record<string, any>);
    return NextResponse.json({ curriculum: validated });
  } catch (err: unknown) {
    console.error('Parse PDF error:', err);
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Failed to process PDF' }, { status: 500 });
  }
}

async function callLLM(text: string): Promise<unknown> {
  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: USER_PROMPT_TEMPLATE(text) },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error('No response from LLM');
  }

  const cleaned = cleanJsonString(rawContent);
  return JSON.parse(cleaned);
}
