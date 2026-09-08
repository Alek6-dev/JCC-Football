import fs from 'fs';
import path from 'path';

type Rule = {
  name: string;
  description: string;
  roots: string[];
  patterns: RegExp[];
  ignore?: RegExp[];
};

const ROOT = process.cwd();

const rules: Rule[] = [
  {
    name: 'no-supabase-in-ui',
    description: 'Les ecrans et composants doivent passer par des services/repositories, pas importer Supabase directement.',
    roots: ['app', 'components'],
    patterns: [
      /from ['"]@\/lib\/supabase['"]/,
      /from ['"].*\/lib\/supabase['"]/,
      /\bsupabase\.(from|rpc|auth|storage)\b/,
    ],
    ignore: [
      /app[\\/]api[\\/]admin[\\/].+\+api\.ts$/,
    ],
  },
  {
    name: 'no-scoring-copy-in-api',
    description: 'Les routes scoring doivent utiliser lib/scoring.ts et ne pas recopier le bareme.',
    roots: ['api/scoring'],
    patterns: [
      /const\s+SCORING_CONFIG\s*=/,
      /function\s+calcScore\s*\(/,
      /function\s+calcPassAccuracy\s*\(/,
      /function\s+calcTeamGoalPts\s*\(/,
    ],
  },
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const result: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.expo') continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(fullPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      result.push(fullPath);
    }
  }
  return result;
}

const violations: string[] = [];

for (const rule of rules) {
  for (const root of rule.roots) {
    const files = walk(path.join(ROOT, root));
    for (const file of files) {
      const relative = path.relative(ROOT, file);
      if (rule.ignore?.some(pattern => pattern.test(relative))) continue;

      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of rule.patterns) {
        if (pattern.test(content)) {
          violations.push(`${rule.name}: ${relative}\n  ${rule.description}`);
          break;
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error('\nArchitecture check failed:\n');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  console.error('\nSi une exception est volontaire, documente-la et ajuste scripts/check-architecture.ts.\n');
  process.exit(1);
}

console.log('Architecture check passed.');
