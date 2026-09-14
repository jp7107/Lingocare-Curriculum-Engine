import PDFParser from 'pdf2json';

export interface ExtractedPdfData {
  rawText: string;
  cleanLines: string[];
  cleanText: string;
}

export async function extractPdfDetails(buffer: Buffer): Promise<ExtractedPdfData> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParser = new (PDFParser as any)(null, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfParser.on('pdfParser_dataError', (errData: any) => reject(new Error(errData?.parserError || 'Failed to parse PDF')));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        const rawText: string = pdfParser.getRawTextContent() || '';
        const allLines: string[] = [];

        for (const page of pdfData?.Pages || []) {
          const texts: { x: number; y: number; text: string }[] = (page?.Texts || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((t: any) => {
              let text = '';
              try {
                text = decodeURIComponent(t.R?.[0]?.T || '').trim();
              } catch {
                text = String(t.R?.[0]?.T || '').trim();
              }
              return {
                x: Number(t.x) || 0,
                y: Number(t.y) || 0,
                text,
              };
            })
            .filter((t: { text: string }) => t.text.length > 0)
            .sort((a: { x: number; y: number }, b: { x: number; y: number }) =>
              Math.abs(a.y - b.y) > 0.4 ? a.y - b.y : a.x - b.x
            );

          let currentLine: string[] = [];
          let currentY = -1;

          for (const item of texts) {
            if (currentY === -1 || Math.abs(item.y - currentY) < 0.4) {
              currentLine.push(item.text);
              if (currentY === -1) currentY = item.y;
            } else {
              allLines.push(currentLine.join(' '));
              currentLine = [item.text];
              currentY = item.y;
            }
          }
          if (currentLine.length > 0) {
            allLines.push(currentLine.join(' '));
          }
        }

        resolve({
          rawText,
          cleanLines: allLines,
          cleanText: allLines.join('\n'),
        });
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const details = await extractPdfDetails(buffer);
  return details.cleanText || details.rawText;
}
