import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const tmpPath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
  writeFileSync(tmpPath, buffer);
  
  try {
    const script = `
      require('pdf-parse')(require('fs').readFileSync('${tmpPath}'))
        .then(data => process.stdout.write(data.text))
        .catch(err => { console.error(err); process.exit(1); });
    `;
    const output = execSync(`node -e "${script.replace(/\n/g, '')}"`, { maxBuffer: 1024 * 1024 * 10 });
    unlinkSync(tmpPath);
    return output.toString();
  } catch (error) {
    try { unlinkSync(tmpPath); } catch { /* ignore cleanup error */ }
    console.error("Error in pdf-parse child process:", error);
    throw new Error("Failed to extract text from PDF");
  }
}
