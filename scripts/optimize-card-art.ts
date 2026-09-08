/**
 * scripts/optimize-card-art.ts
 *
 * Converts generated master card artworks into app-ready WebP files.
 *
 * Put source PNG/JPG files in:
 *   generated/card-art-master/paris-saint-germain/
 *
 * Output files are written to:
 *   generated/card-art-app/paris-saint-germain/
 *
 * Usage:
 *   npm run optimize-card-art -- --club "Paris Saint Germain"
 *   npm run optimize-card-art -- --club "Paris Saint Germain" --width 1200 --quality 82
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

type Options = {
  club?: string;
  inputDir: string;
  outputDir: string;
  width: number;
  quality: number;
  force: boolean;
};

function argValue(name: string): string | undefined {
  const prefixed = `${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefixed));
  if (inline) return inline.slice(prefixed.length);
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unknown';
}

function parseOptions(): Options {
  const club = argValue('--club');
  const clubSlug = club ? slugify(club) : undefined;
  const inputRoot = argValue('--input-dir') ?? path.join('generated', 'card-art-master');
  const outputRoot = argValue('--output-dir') ?? path.join('generated', 'card-art-app');

  return {
    club,
    inputDir: clubSlug ? path.join(inputRoot, clubSlug) : inputRoot,
    outputDir: clubSlug ? path.join(outputRoot, clubSlug) : outputRoot,
    width: Number(argValue('--width') ?? 1200),
    quality: Number(argValue('--quality') ?? 82),
    force: process.argv.includes('--force'),
  };
}

function collectImages(inputDir: string): string[] {
  const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  if (!fs.existsSync(inputDir)) return [];

  const result: string[] = [];
  for (const entry of fs.readdirSync(inputDir, { withFileTypes: true })) {
    const fullPath = path.join(inputDir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectImages(fullPath));
    } else if (allowed.has(path.extname(entry.name).toLowerCase())) {
      result.push(fullPath);
    }
  }
  return result;
}

function outputPathFor(inputPath: string, inputDir: string, outputDir: string): string {
  const relative = path.relative(inputDir, inputPath);
  const parsed = path.parse(relative);
  return path.join(outputDir, parsed.dir, `${parsed.name}.webp`);
}

function formatBytes(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

async function main() {
  const options = parseOptions();
  if (!Number.isFinite(options.width) || options.width < 300) {
    throw new Error('--width doit être un nombre >= 300.');
  }
  if (!Number.isFinite(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error('--quality doit être entre 1 et 100.');
  }

  const files = collectImages(options.inputDir);
  console.log(`Input: ${options.inputDir}`);
  console.log(`Output: ${options.outputDir}`);
  console.log(`Width: ${options.width}px | WebP quality: ${options.quality}`);
  console.log(`${files.length} image(s) trouvée(s)\n`);

  if (!files.length) {
    console.log('Dépose tes images master dans ce dossier puis relance le script.');
    return;
  }

  for (const inputPath of files) {
    const outputPath = outputPathFor(inputPath, options.inputDir, options.outputDir);
    if (!options.force && fs.existsSync(outputPath)) {
      console.log(`skip ${outputPath}`);
      continue;
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(inputPath)
      .rotate()
      .resize({
        width: options.width,
        withoutEnlargement: true,
      })
      .webp({
        quality: options.quality,
        effort: 5,
      })
      .toFile(outputPath);

    const before = fs.statSync(inputPath).size;
    const after = fs.statSync(outputPath).size;
    console.log(`${path.basename(inputPath)} -> ${path.basename(outputPath)} | ${formatBytes(before)} -> ${formatBytes(after)}`);
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
