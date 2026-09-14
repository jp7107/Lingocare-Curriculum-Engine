import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { readFileSync } from "fs";

async function run() {
  const buffer = readFileSync("package.json"); // Just test if import works
  console.log(typeof pdfjsLib.getDocument);
}
run();
