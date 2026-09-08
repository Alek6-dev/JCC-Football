/**
 * scripts/generate-card-art.ts
 *
 * Generates landscape card artworks from official player portraits using
 * OpenAI gpt-image-2, then optionally uploads them to Supabase Storage and
 * updates players.card_art_uri.
 *
 * Usage:
 *   npx tsx scripts/generate-card-art.ts --club "Paris Saint Germain" --limit 2
 *   npx tsx scripts/generate-card-art.ts --club "Paris Saint Germain" --limit 2 --apply
 *   npx tsx scripts/generate-card-art.ts --player "Desire Doue" --apply
 *   npx tsx scripts/generate-card-art.ts --all --missing-only --apply
 *
 * Default mode is dry-run: it prints targets and prompts without calling
 * OpenAI, uploading files, or updating the database.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

type CardType = 'player' | 'coach' | 'badge';
type Position = 'ATT' | 'MIL' | 'DEF' | 'GK' | string | null;

type PlayerRow = {
  id: string;
  name: string;
  club: string;
  position: Position;
  card_type: CardType;
  image_uri: string | null;
  card_art_uri: string | null;
  collection_status: 'active' | 'hidden' | 'legacy';
  season: string;
  season_minutes: number | null;
  club_letter: string | null;
  club_card_number: number | null;
};

type ManifestEntry = {
  player_id: string;
  name: string;
  club: string;
  status: 'dry-run' | 'generated' | 'uploaded' | 'updated' | 'skipped' | 'error';
  local_path?: string;
  storage_path?: string;
  public_url?: string;
  prompt?: string;
  model: string;
  size: string;
  quality: string;
  created_at: string;
  error?: string;
};

type CliOptions = {
  apply: boolean;
  all: boolean;
  missingOnly: boolean;
  force: boolean;
  club?: string;
  player?: string;
  limit?: number;
  season: string;
  bucket: string;
  outputDir: string;
  manifestPath: string;
  size: string;
  quality: string;
  model: string;
  styleRefs: string[];
};

function parseStyleRefs(value: string | undefined): string[] {
  return value
    ? value.split(',').map(ref => ref.trim()).filter(Boolean)
    : [];
}

const CLUB_COLORS: Record<string, { kit: string; energy: string }> = {
  'AJ Auxerre': {
    kit: 'blanc pur et bleu roi, avec détails graphiques nets',
    energy: 'bleu roi, blanc lumineux et touches argentées',
  },
  Angers: {
    kit: 'noir profond et blanc, avec lignes sobres et contrastées',
    energy: 'noir, blanc, reflets argentés et éclats dorés discrets',
  },
  'AS Monaco': {
    kit: 'rouge vif et blanc, avec diagonale graphique simplifiée',
    energy: 'rouge, blanc, or pâle et reflets bleutés',
  },
  Brest: {
    kit: 'rouge intense et blanc, avec accents marins sombres',
    energy: 'rouge, blanc, bleu nuit et éclats lumineux',
  },
  'Clermont Foot': {
    kit: 'rouge profond et bleu sombre, avec accents blancs',
    energy: 'rouge, bleu nuit, blanc et reflets violets',
  },
  'FC Lorient': {
    kit: 'orange vif et noir, avec détails blancs',
    energy: 'orange, noir, blanc et reflets dorés',
  },
  'FC Metz': {
    kit: 'grenat profond et blanc, avec accents dorés subtils',
    energy: 'grenat, blanc, or et rouge sombre',
  },
  'FC Nantes': {
    kit: 'jaune lumineux et vert, avec détails graphiques propres',
    energy: 'jaune, vert, blanc et éclats dorés',
  },
  'Le Havre': {
    kit: 'bleu ciel et bleu marine, avec détails blancs',
    energy: 'bleu ciel, bleu marine, blanc et reflets électriques',
  },
  Lens: {
    kit: 'rouge sang et jaune doré, avec accents noirs',
    energy: 'rouge, jaune doré, noir et éclats lumineux',
  },
  Lille: {
    kit: 'rouge profond et bleu marine, avec détails blancs',
    energy: 'rouge, bleu marine, blanc et reflets violets',
  },
  Lyon: {
    kit: 'blanc dominant avec bandes rouge et bleu',
    energy: 'blanc, rouge, bleu royal et reflets argentés',
  },
  Marseille: {
    kit: 'blanc éclatant et bleu ciel, avec détails graphiques sobres',
    energy: 'bleu ciel, blanc, argent et touches dorées',
  },
  Montpellier: {
    kit: 'orange et bleu marine, avec détails blancs',
    energy: 'orange, bleu marine, blanc et reflets violets',
  },
  Nice: {
    kit: 'rouge et noir, avec détails blancs',
    energy: 'rouge, noir, blanc et éclats incandescents',
  },
  'Paris Saint Germain': {
    kit: 'bleu profond, zone centrale rouge et légers accents blancs',
    energy: 'bleu, rouge, violet et blanc',
  },
  "Paris Saint-Germain": {
    kit: 'bleu profond, zone centrale rouge et légers accents blancs',
    energy: 'bleu, rouge, violet et blanc',
  },
  PSG: {
    kit: 'bleu profond, zone centrale rouge et légers accents blancs',
    energy: 'bleu, rouge, violet et blanc',
  },
  Rennes: {
    kit: 'rouge vif et noir, avec détails blancs',
    energy: 'rouge, noir, blanc et reflets écarlates',
  },
  Strasbourg: {
    kit: 'bleu royal et blanc, avec détails graphiques clairs',
    energy: 'bleu royal, blanc, argent et reflets électriques',
  },
  Toulouse: {
    kit: 'violet profond et blanc, avec accents rose pâle',
    energy: 'violet, blanc, rose et bleu nuit',
  },
};

const ACTIONS_BY_POSITION: Record<string, string[]> = {
  ATT: [
    'déclencher une frappe enroulée en pleine course, corps en diagonale, appui puissant et ballon quittant le pied',
    'accélérer après un changement d’appui explosif, ballon proche du pied, regard déjà tourné vers le but',
    'contrôler le ballon en extension avant de frapper, avec une pose aérienne mais crédible',
    'préparer un crochet court pour éliminer un adversaire invisible, avec une sensation de vitesse et de technique',
  ],
  MIL: [
    'préparer une passe créative en mouvement, corps ouvert, regard concentré vers une zone libre hors champ',
    'réaliser un contrôle orienté sous pression invisible, ballon proche du pied et buste en rotation',
    'armer une frappe lointaine contrôlée, avec une diagonale forte et une énergie contenue',
    'changer de direction balle au pied, posture basse et technique, comme après une feinte réussie',
  ],
  DEF: [
    'jaillir pour intercepter le ballon, jambe tendue vers la trajectoire et buste projeté vers l’avant',
    'relancer après une récupération, ballon maîtrisé, posture solide et regard vers l’avant',
    'réaliser un tacle propre et spectaculaire sans adversaire visible, avec mouvement latéral lisible',
    'gagner un duel aérien imaginaire, corps en extension et ballon proche de la tête',
  ],
  GK: [
    'plonger latéralement pour repousser un tir, bras tendus vers le ballon et corps en suspension',
    'effectuer un arrêt réflexe à bout portant, mains ouvertes et regard fixé sur le ballon',
    'sortir dans les airs pour capter le ballon, genou levé et silhouette dominante',
    'relancer rapidement après une parade, ballon dans la main et énergie vers l’avant',
  ],
  coach: [
    'debout au bord du terrain, posture intense et concentrée, bras indiquant une consigne tactique',
    'en train de donner une instruction décisive, expression calme mais déterminée, lumière de stade dramatique',
  ],
};

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function argValue(name: string): string | undefined {
  const prefixed = `${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefixed));
  if (inline) return inline.slice(prefixed.length);
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function parseOptions(): CliOptions {
  const styleRefs = parseStyleRefs(argValue('--style-refs') ?? process.env.CARD_ART_STYLE_REFS);

  return {
    apply: process.argv.includes('--apply'),
    all: process.argv.includes('--all'),
    missingOnly: process.argv.includes('--missing-only'),
    force: process.argv.includes('--force'),
    club: argValue('--club'),
    player: argValue('--player'),
    limit: argValue('--limit') ? Number(argValue('--limit')) : undefined,
    season: argValue('--season') ?? '2025-26',
    bucket: argValue('--bucket') ?? 'card-art',
    outputDir: argValue('--output-dir') ?? path.join('generated', 'card-art'),
    manifestPath: argValue('--manifest') ?? path.join('generated', 'card-art-manifest.json'),
    size: argValue('--size') ?? '1536x1024',
    quality: argValue('--quality') ?? 'high',
    model: argValue('--model') ?? 'gpt-image-2',
    styleRefs,
  };
}

function assertOptions(options: CliOptions) {
  const targetCount = [options.all, Boolean(options.club), Boolean(options.player)].filter(Boolean).length;
  if (targetCount !== 1) {
    throw new Error('Choisis exactement une cible: --all, --club "Nom du club", ou --player "Nom du joueur".');
  }
  if (options.limit !== undefined && (!Number.isFinite(options.limit) || options.limit < 1)) {
    throw new Error('--limit doit être un nombre positif.');
  }
  if (options.apply && !process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY manquante dans .env.');
  }
  if (options.apply && (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes dans .env.');
  }
  for (const ref of options.styleRefs) {
    if (!fs.existsSync(ref)) throw new Error(`Référence de style introuvable: ${ref}`);
  }
}

function getSupabase() {
  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
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

function pickAction(player: PlayerRow): string {
  const key = player.card_type === 'coach' ? 'coach' : player.position ?? 'MIL';
  const actions = ACTIONS_BY_POSITION[key] ?? ACTIONS_BY_POSITION.MIL;
  const seed = [...player.name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return actions[seed % actions.length];
}

function clubColors(club: string) {
  return CLUB_COLORS[club] ?? {
    kit: 'les couleurs principales du club, simplifiées et non officielles',
    energy: 'les couleurs principales du club, blanc lumineux et reflets violets',
  };
}

function buildPrompt(player: PlayerRow): string {
  const colors = clubColors(player.club);
  const subject = player.card_type === 'coach'
    ? `${player.name}, coach de football représentant ${player.club}`
    : `${player.name}, joueur de football au poste ${player.position ?? 'footballer'}, représentant ${player.club}`;
  const ballRule = player.card_type === 'coach'
    ? 'Le ballon n’est pas nécessaire pour un coach.'
    : 'Le ballon doit être présent et bien intégré à l’action.';

  return [
    'Créer une illustration sportive au format paysage 16:9, dans un style trading card game premium, fantasy football, semi-réaliste mais clairement dessiné.',
    '',
    `Sujet principal : ${subject}.`,
    '',
    'Le portrait officiel sert uniquement de guide d’identité : forme générale du visage, coupe de cheveux, expression, âge apparent et silhouette. Ne pas recopier le rendu photo du visage. Réinterpréter le visage en dessin peint stylisé, avec contours graphiques visibles, ombres illustrées, plans de lumière simplifiés, détails de peau réduits et texture de peinture numérique.',
    '',
    'Le visage doit être clairement illustré et peint, pas photoréaliste. Il doit rester reconnaissable dans ses traits caractéristiques généraux, mais ressembler à un personnage de carte collectible premium, pas à une photographie ni à un portrait réaliste collé sur un corps dessiné.',
    '',
    'Utiliser les deux artworks de référence Dembélé et Doué uniquement comme référence de direction artistique : peinture numérique premium, intensité lumineuse, cadrage paysage, fond de stade abstrait, traînées d’énergie, rendu trading card haut de gamme. Ne pas copier leur visage, leur pose exacte ou leur composition exacte.',
    '',
    `Action : le représenter en train de ${pickAction(player)}. La pose doit être spectaculaire mais crédible, avec une diagonale forte du corps, une impression de vitesse, d’explosivité et de technique.`,
    '',
    `Tenue : maillot inspiré de ${player.club}, simplifié et non réaliste. Utiliser principalement ${colors.kit}. Ne pas afficher de logo, sponsor, marque, écusson détaillé, texte ou élément officiel identifiable. Le maillot doit seulement évoquer visuellement les couleurs et l’esprit du club, dans un design graphique propre et lisible.`,
    '',
    'Style visuel : illustration fantasy sport haut de gamme, proche d’un artwork de carte collectible moderne. Rendu peint numérique, contours dynamiques, ombres marquées, lumières dramatiques, textures de pinceau visibles, énergie visuelle forte. Le sujet ne doit pas ressembler à une photo retouchée : il doit être dessiné, stylisé, expressif et intégré dans une direction artistique cohérente.',
    '',
    `Composition : sujet seul au centre de l’image, aucun autre joueur visible. ${ballRule} Image en paysage, action lisible, espace suffisant autour du sujet pour intégration dans une carte de jeu.`,
    '',
    `Arrière-plan : stade abstrait, projecteurs, foule suggérée mais floue, ambiance nocturne intense. Ajouter des traînées d’énergie et de peinture autour du sujet, principalement ${colors.energy}, pour donner une sensation de vitesse et de rareté de carte premium.`,
    '',
    'Important : varier l’action et l’angle de caméra par rapport aux images de référence. Ne pas refaire exactement une course frontale avec le ballon devant le pied. Chercher une pose différente, technique ou aérienne, tout en gardant le même style graphique.',
    '',
    'Contraintes :',
    '- format paysage 16:9',
    '- pas de texte',
    '- pas de logo',
    '- pas de sponsor',
    '- pas de marque visible',
    '- pas d’autres joueurs',
    '- pas de rendu photographique',
    '- pas de visage photoréaliste',
    '- pas de texture de peau photographique',
    '- pas d’effet photo retouchée',
    '- pas de portrait réaliste collé sur un corps dessiné',
    '- pas de maillot officiel exact',
    '- pas de visage déformé',
    '- pas de mains ou jambes supplémentaires',
    '- image directement exploitable comme illustration de carte de jeu',
  ].join('\n');
}

function outputPathFor(player: PlayerRow, options: CliOptions) {
  const clubSlug = slugify(player.club);
  const number = player.club_letter && player.club_card_number
    ? `${player.club_letter}-${String(player.club_card_number).padStart(2, '0')}`
    : 'no-number';
  return path.join(options.outputDir, clubSlug, `${number}-${slugify(player.name)}.png`);
}

function storagePathFor(player: PlayerRow, localPath: string) {
  const clubSlug = slugify(player.club);
  return `${player.season}/${clubSlug}/${path.basename(localPath)}`.replace(/\\/g, '/');
}

function readManifest(options: CliOptions): ManifestEntry[] {
  if (!fs.existsSync(options.manifestPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(options.manifestPath, 'utf-8')) as ManifestEntry[];
  } catch {
    return [];
  }
}

function writeManifest(options: CliOptions, entries: ManifestEntry[]) {
  fs.mkdirSync(path.dirname(options.manifestPath), { recursive: true });
  fs.writeFileSync(options.manifestPath, JSON.stringify(entries, null, 2), 'utf-8');
}

function upsertManifest(options: CliOptions, entry: ManifestEntry) {
  const entries = readManifest(options);
  const idx = entries.findIndex(e => e.player_id === entry.player_id);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  writeManifest(options, entries);
}

async function fetchPlayers(options: CliOptions): Promise<PlayerRow[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('players')
    .select('id, name, club, position, card_type, image_uri, card_art_uri, collection_status, season, season_minutes, club_letter, club_card_number')
    .in('card_type', ['player', 'coach'])
    .eq('season', options.season)
    .order('club', { ascending: true })
    .order('club_card_number', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
    .limit(2000);

  if (options.club) query = query.eq('club', options.club);
  if (options.player) query = query.ilike('name', `%${options.player}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let players = (data ?? []) as PlayerRow[];
  players = players.filter(p => (p.collection_status ?? 'active') === 'active');
  players = players.filter(p => Boolean(p.image_uri));
  if (options.missingOnly && !options.force) {
    players = players.filter(p => !p.card_art_uri);
  }
  if (!options.force) {
    players = players.filter(p => {
      const localPath = outputPathFor(p, options);
      return !fs.existsSync(localPath) || !p.card_art_uri;
    });
  }
  if (options.limit) players = players.slice(0, options.limit);
  return players;
}

async function blobFromUrl(url: string, filename: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement portrait impossible (${res.status}) pour ${filename}`);
  const contentType = res.headers.get('content-type') ?? 'image/png';
  const bytes = await res.arrayBuffer();
  return new Blob([bytes], { type: contentType });
}

function blobFromFile(filePath: string): Blob {
  const bytes = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const type = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  return new Blob([bytes], { type });
}

async function callOpenAIEdit(player: PlayerRow, prompt: string, options: CliOptions): Promise<Buffer> {
  const portrait = await blobFromUrl(player.image_uri!, `${slugify(player.name)}-portrait.png`);
  const styleRefBlobs = options.styleRefs.map(ref => ({ path: ref, blob: blobFromFile(ref) }));

  async function submit(imageField: 'image[]' | 'image'): Promise<Response> {
    const form = new FormData();
    form.append('model', options.model);
    form.append('prompt', prompt);
    form.append('size', options.size);
    form.append('quality', options.quality);
    form.append('output_format', 'png');
    form.append(imageField, portrait, `${slugify(player.name)}-portrait.png`);
    for (const ref of styleRefBlobs) {
      form.append(imageField, ref.blob, path.basename(ref.path));
    }

    return fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
  }

  let res = await submit('image[]');
  if (!res.ok && res.status === 400) {
    res = await submit('image');
  }

  const json = await res.json() as {
    data?: { b64_json?: string; url?: string }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(json.error?.message ?? `OpenAI HTTP ${res.status}`);
  }

  const first = json.data?.[0];
  if (!first) throw new Error('Réponse OpenAI sans image.');
  if (first.b64_json) return Buffer.from(first.b64_json, 'base64');
  if (first.url) {
    const img = await fetch(first.url);
    if (!img.ok) throw new Error(`Téléchargement image générée impossible (${img.status})`);
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error('Réponse OpenAI sans b64_json ni url.');
}

async function ensureBucket(options: CliOptions) {
  const supabase = getSupabase();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(error.message);
  if (buckets?.some(b => b.name === options.bucket)) return;

  const { error: createError } = await supabase.storage.createBucket(options.bucket, {
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });
  if (createError) throw new Error(createError.message);
}

async function uploadAndUpdate(player: PlayerRow, image: Buffer, localPath: string, prompt: string, options: CliOptions) {
  const supabase = getSupabase();
  const storagePath = storagePathFor(player, localPath);

  const { error: uploadError } = await supabase.storage
    .from(options.bucket)
    .upload(storagePath, image, {
      contentType: 'image/png',
      upsert: true,
    });
  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage.from(options.bucket).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from('players')
    .update({ card_art_uri: publicUrl })
    .eq('id', player.id);
  if (updateError) throw new Error(updateError.message);

  upsertManifest(options, {
    player_id: player.id,
    name: player.name,
    club: player.club,
    status: 'updated',
    local_path: localPath,
    storage_path: storagePath,
    public_url: publicUrl,
    prompt,
    model: options.model,
    size: options.size,
    quality: options.quality,
    created_at: new Date().toISOString(),
  });
}

async function main() {
  loadEnv();
  const options = parseOptions();
  assertOptions(options);

  console.log(`Mode: ${options.apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Model: ${options.model} | size: ${options.size} | quality: ${options.quality}`);
  console.log(`Season: ${options.season} | bucket: ${options.bucket}`);
  console.log(`Style refs: ${options.styleRefs.join(' | ')}`);
  if (!options.apply) console.log('Ajoute --apply pour générer, uploader et mettre à jour la DB.');
  console.log('');

  const targets = await fetchPlayers(options);
  if (!targets.length) {
    console.log('Aucune cible trouvée.');
    return;
  }

  console.log(`${targets.length} cible(s):`);
  for (const p of targets) {
    console.log(`- ${p.name} (${p.club}, ${p.position ?? p.card_type})`);
  }
  console.log('');

  if (!options.apply) {
    for (const p of targets) {
      const prompt = buildPrompt(p);
      const localPath = outputPathFor(p, options);
      console.log('='.repeat(80));
      console.log(`${p.name} -> ${localPath}`);
      console.log(prompt);
      upsertManifest(options, {
        player_id: p.id,
        name: p.name,
        club: p.club,
        status: 'dry-run',
        local_path: localPath,
        prompt,
        model: options.model,
        size: options.size,
        quality: options.quality,
        created_at: new Date().toISOString(),
      });
    }
    return;
  }

  await ensureBucket(options);

  for (const [index, player] of targets.entries()) {
    const prompt = buildPrompt(player);
    const localPath = outputPathFor(player, options);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    console.log(`[${index + 1}/${targets.length}] ${player.name} (${player.club})`);

    try {
      const image = await callOpenAIEdit(player, prompt, options);
      fs.writeFileSync(localPath, image);
      await uploadAndUpdate(player, image, localPath, prompt, options);
      console.log(`  OK -> ${localPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ERREUR: ${message}`);
      upsertManifest(options, {
        player_id: player.id,
        name: player.name,
        club: player.club,
        status: 'error',
        local_path: localPath,
        prompt,
        model: options.model,
        size: options.size,
        quality: options.quality,
        created_at: new Date().toISOString(),
        error: message,
      });
    }
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
