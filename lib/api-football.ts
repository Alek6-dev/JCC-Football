/**
 * Client API Football — serveur uniquement
 *
 * Ce fichier ne doit JAMAIS être importé côté client (pas de 'use client').
 * La clé API est une variable d'environnement non préfixée EXPO_PUBLIC_.
 *
 * Toute modification du barème ou de la logique de calcul → lib/scoring.ts
 * Ce fichier ne fait que fetch + normaliser les données brutes.
 */

const API_BASE = 'https://v3.football.api-sports.io';
const LIGUE1_ID = 61;
const CURRENT_SEASON = 2025;

// ---------------------------------------------------------------------------
// Types — structure brute retournée par API Football
// ---------------------------------------------------------------------------

export interface ApiPlayerStats {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: [
    {
      games: {
        minutes: number | null;
        number: number;
        position: string;
        rating: string | null;
        captain: boolean;
        substitute: boolean;
      };
      shots:    { total: number | null; on: number | null };
      goals:    { total: number | null; conceded: number | null; assists: number | null; saves: number | null };
      passes:   { total: number | null; key: number | null; accuracy: string | null };
      tackles:  { total: number | null; blocks: number | null; interceptions: number | null };
      duels:    { total: number | null; won: number | null };
      dribbles: { attempts: number | null; success: number | null; past: number | null };
      fouls:    { drawn: number | null; committed: number | null };
      cards:    { yellow: number; red: number };
      penalty:  {
        won: number | null;
        commited: number | null;
        scored: number;
        missed: number;
        saved: number | null;
      };
    }
  ];
}

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { round: string };
  teams: {
    home: { id: number; name: string; winner: boolean | null };
    away: { id: number; name: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime:  { home: number | null; away: number | null };
  };
}

// Données normalisées pour notre barème — une ligne par joueur par match
export interface NormalizedPlayerMatchStats {
  apiPlayerId:      number;
  apiPlayerName:    string;
  apiFixtureId:     number;
  minutesPlayed:    number;
  isSubstitute:     boolean;
  goals:            number;
  assists:          number;
  shotsOn:          number;
  keyPasses:        number;
  passesTotal:      number;
  passesAccurate:   number;  // nombre brut, pas un %, cf. API Football
  tackles:          number;
  interceptions:    number;
  blocks:           number;
  duelsTotal:       number;
  duelsWon:         number;
  dribblesSuccess:  number;
  dribblesPast:     number;
  foulsDrawn:       number;
  foulsCommitted:   number;
  yellowCards:      number;
  redCards:         number;
  saves:            number;
  goalsConceded:    number;
  penaltyWon:       number;
  penaltyCommitted: number;
  penaltyScored:    number;
  penaltyMissed:    number;
  penaltySaved:     number;
  // Données brutes conservées pour stockage en DB
  raw: ApiPlayerStats['statistics'][0];
}

// ---------------------------------------------------------------------------
// Client interne — ne pas exporter, passer par les fonctions publiques
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error('API_FOOTBALL_KEY manquante — variable d\'environnement serveur non définie');
  }
  return key;
}

async function apiFetch<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const response = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': getApiKey(),
      'Content-Type': 'application/json',
    },
    // Pas de cache — on veut toujours des données fraîches
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API Football erreur ${response.status} sur ${endpoint}`);
  }

  const json = await response.json();

  // L'API retourne errors: [] en cas de succès ou errors: {key: msg} en cas d'erreur
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API Football erreur métier : ${JSON.stringify(json.errors)}`);
  }

  return json.response as T;
}

// ---------------------------------------------------------------------------
// Fonctions publiques
// ---------------------------------------------------------------------------

/**
 * Récupère les matchs Ligue 1 terminés pour une journée donnée.
 */
export async function fetchFixturesByMatchday(matchday: number): Promise<ApiFixture[]> {
  return apiFetch<ApiFixture[]>('fixtures', {
    league:  LIGUE1_ID,
    season:  CURRENT_SEASON,
    round:   `Regular Season - ${matchday}`,
  });
}

/**
 * Récupère les stats brutes de tous les joueurs pour un match donné.
 * Retourne un tableau normalisé avec le teamId, prêt pour le calcul de scoring.
 * Un seul appel API par match.
 */
export async function fetchPlayerStatsByFixture(
  fixtureId: number
): Promise<(NormalizedPlayerMatchStats & { teamId: number })[]> {
  const raw = await apiFetch<{ team: { id: number }; players: ApiPlayerStats[] }[]>(
    'fixtures/players',
    { fixture: fixtureId }
  );

  const result: (NormalizedPlayerMatchStats & { teamId: number })[] = [];

  for (const teamData of raw) {
    for (const playerData of teamData.players) {
      const s = playerData.statistics[0];
      if (!s) continue;

      result.push({
        teamId:           teamData.team.id,
        apiPlayerId:      playerData.player.id,
        apiPlayerName:    playerData.player.name,
        apiFixtureId:     fixtureId,
        minutesPlayed:    s.games.minutes ?? 0,
        isSubstitute:     s.games.substitute,
        goals:            s.goals.total ?? 0,
        assists:          s.goals.assists ?? 0,
        shotsOn:          s.shots.on ?? 0,
        keyPasses:        s.passes.key ?? 0,
        passesTotal:      s.passes.total ?? 0,
        passesAccurate:   s.passes.accuracy ? parseInt(s.passes.accuracy, 10) : 0,
        tackles:          s.tackles.total ?? 0,
        interceptions:    s.tackles.interceptions ?? 0,
        blocks:           s.tackles.blocks ?? 0,
        duelsTotal:       s.duels.total ?? 0,
        duelsWon:         s.duels.won ?? 0,
        dribblesSuccess:  s.dribbles.success ?? 0,
        dribblesPast:     s.dribbles.past ?? 0,
        foulsDrawn:       s.fouls.drawn ?? 0,
        foulsCommitted:   s.fouls.committed ?? 0,
        yellowCards:      s.cards.yellow ?? 0,
        redCards:         s.cards.red ?? 0,
        saves:            s.goals.saves ?? 0,
        goalsConceded:    s.goals.conceded ?? 0,
        penaltyWon:       s.penalty.won ?? 0,
        penaltyCommitted: s.penalty.commited ?? 0,
        penaltyScored:    s.penalty.scored ?? 0,
        penaltyMissed:    s.penalty.missed ?? 0,
        penaltySaved:     s.penalty.saved ?? 0,
        raw:              s,
      });
    }
  }

  return result;
}

/**
 * Récupère les stats de saison d'un joueur (pour backfill et filtrage éligibilité).
 * Utilisé pour ne garder que les joueurs ayant joué >= 90 min cumulées.
 */
export async function fetchPlayerSeasonStats(apiPlayerId: number): Promise<{
  minutesTotal: number;
  appearances: number;
} | null> {
  const raw = await apiFetch<{
    statistics: [{ games: { appearences: number | null; minutes: number | null } }];
  }[]>('players', {
    id:     apiPlayerId,
    season: CURRENT_SEASON,
    league: LIGUE1_ID,
  });

  if (!raw.length || !raw[0].statistics?.length) return null;

  const stats = raw[0].statistics[0].games;
  return {
    minutesTotal: stats.minutes ?? 0,
    appearances:  stats.appearences ?? 0,
  };
}
