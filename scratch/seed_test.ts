import fs from 'fs';
import path from 'path';
import { ocrPdf, structureWithMistral } from '../src/lib/mistral';
import { importTimetable } from '../src/lib/timetable/importer';

async function main() {
  const imagePath = path.join(__dirname, '..', 'imgoftt and scripts', 'CSE(8)_pages-to-jpg-0006.jpg');
  
  console.log(`Reading image from: ${imagePath}`);
  const buffer = fs.readFileSync(imagePath);
  
  console.log('1. Running Mistral OCR on image...');
  const text = await ocrPdf(buffer, 'CSE(8)_pages-to-jpg-0006.jpg');
  
  console.log('2. Structuring OCR text with Mistral LLM (using new robust prompt)...');
  const parsed = await structureWithMistral(text);
  
  console.log('--- EXTRACTED COURSES ---');
  console.dir(parsed.courses, { depth: null });
  
  console.log('\\n--- EXTRACTED SLOTS (First 10) ---');
  console.dir(parsed.slots.slice(0, 10), { depth: null });
  
  console.log('\\n3. Importing Timetable to DB...');
  const { timetable, summary } = await importTimetable(parsed, 'CSE(8)_pages-to-jpg-0006.jpg');
  
  console.log('\\nSUCCESS! Timetable DB ID:', timetable.id);
  console.log('Summary:', summary);
}

main().catch(console.error);
