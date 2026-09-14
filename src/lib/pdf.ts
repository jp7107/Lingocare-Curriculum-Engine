import PDFParser from 'pdf2json';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParser = new (PDFParser as any)(null, 1); // 1 = text mode

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
    pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));

    pdfParser.parseBuffer(buffer);
  });
}

