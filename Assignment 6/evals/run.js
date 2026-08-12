import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read server port dynamically from local .env config
let port = 3000;
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^PORT=(\d+)/m);
  if (match) {
    port = parseInt(match[1], 10);
  }
}

const casesPath = path.join(__dirname, 'cases.json');
if (!fs.existsSync(casesPath)) {
  console.error("Error: evals/cases.json not found.");
  process.exit(1);
}

const casesContent = fs.readFileSync(casesPath, 'utf8');
let cases = [];
try {
  cases = JSON.parse(casesContent);
} catch (err) {
  console.error("Error parsing evals/cases.json:", err.message);
  process.exit(1);
}

if (!Array.isArray(cases) || cases.length === 0) {
  console.log("0 cases to run. Populate evals/cases.json to begin evaluations.");
  process.exit(0);
}

console.log(`Starting evaluation run on ${cases.length} cases...\n`);

let categoryMatches = 0;
let urgencyMatches = 0;
const failures = [];

for (let i = 0; i < cases.length; i++) {
  const c = cases[i];
  const index = i + 1;
  
  try {
    const response = await fetch(`http://localhost:${port}/triage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: c.text })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const catMatch = data.category === c.expected_category;
    const urgMatch = data.urgency === c.expected_urgency;

    if (catMatch) categoryMatches++;
    if (urgMatch) urgencyMatches++;

    console.log(`Case ${index}/${cases.length}: Category Match = ${catMatch ? 'PASS' : 'FAIL'}, Urgency Match = ${urgMatch ? 'PASS' : 'FAIL'}`);

    if (!catMatch || !urgMatch) {
      failures.push({
        index,
        text: c.text,
        expected: { category: c.expected_category, urgency: c.expected_urgency },
        received: { category: data.category, urgency: data.urgency }
      });
    }
  } catch (err) {
    console.error(`Case ${index}/${cases.length} failed to request/parse:`, err.message);
    failures.push({
      index,
      text: c.text,
      error: err.message
    });
  }
}

console.log('\n======================================');
console.log('Evaluation Summary');
console.log('======================================');
console.log(`Category matches: ${categoryMatches}/${cases.length} (${((categoryMatches / cases.length) * 100).toFixed(1)}%)`);
console.log(`Urgency matches:  ${urgencyMatches}/${cases.length} (${((urgencyMatches / cases.length) * 100).toFixed(1)}%)`);

if (failures.length > 0) {
  console.log('\n--- Failed Cases Details ---');
  failures.forEach(f => {
    console.log(`\nCase ${f.index}: "${f.text}"`);
    if (f.error) {
      console.log(`  Request Error: ${f.error}`);
    } else {
      console.log(`  Expected: Category="${f.expected.category}", Urgency="${f.expected.urgency}"`);
      console.log(`  Received: Category="${f.received.category}", Urgency="${f.received.urgency}"`);
    }
  });
} else {
  console.log('\nAll cases passed!');
}
console.log('======================================\n');
