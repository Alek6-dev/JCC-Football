import { ReactNode } from 'react';

export type AdminPlayer = {
  id: string;
  name: string;
  club: string;
  position: string;
  card_type: string;
  base_score: number;
  drop_weight: number;
  season_minutes: number;
  birth_year: number | null;
  api_football_id: number | null;
  api_football_team_id: number | null;
  club_letter: string | null;
  club_card_number: number | null;
  image_uri: string | null;
  card_art_uri: string | null;
  collection_status: 'active' | 'hidden' | 'legacy';
  season: string;
  collection_id: string | null;
  score_count: number;
  avg_score: number | null;
  min_score: number | null;
  max_score: number | null;
  latest_matchdays: number[];
};

export type AdminSeason = {
  id: string;
  season: string;
  name: string;
  status: 'draft' | 'live' | 'archived';
  starts_on: string | null;
  ends_on: string | null;
};

export type AdminCollection = {
  id: string;
  season_id: string;
  code: string;
  name: string;
  type: 'base' | 'special' | 'winter' | 'archive';
  is_primary: boolean;
  pack_enabled: boolean;
  archive_pack_enabled: boolean;
};

export type AdminPlayersResponse = {
  players: AdminPlayer[];
  seasons: AdminSeason[];
  collections: AdminCollection[];
  liveSeason: string;
  selectedSeason: string;
  selectedCollectionId: string | null;
};

export type PlayerScore = {
  matchday: number;
  season: string;
  performance_score: number;
  breakdown: Record<string, number>;
  team_goals_scored: number;
  team_goals_conceded: number;
  team_result: 'win' | 'draw' | 'loss';
  calculated_at: string;
};

export type ApiFootballResult = {
  results: number;
  response: {
    player: { id: number; name: string; photo: string };
    statistics: {
      games: { appearences: number | null; minutes: number | null; rating: string | null };
      goals: { total: number | null; assists: number | null };
      shots: { total: number | null; on: number | null };
      passes: { total: number | null; key: number | null; accuracy: string | null };
      tackles: { total: number | null; interceptions: number | null; blocks: number | null };
      duels: { total: number | null; won: number | null };
      dribbles: { success: number | null; past: number | null };
      fouls: { drawn: number | null; committed: number | null };
      cards: { yellow: number; red: number };
      penalty: { won: number | null; scored: number; missed: number; saved: number | null };
    }[];
  }[];
};

export type FilterProblem = 'all' | 'base50' | 'no_scores' | 'base50_no_scores' | 'zero_minutes';
export type FilterPosition = 'all' | 'GK' | 'DEF' | 'MIL' | 'ATT';
export type CollectionStatus = AdminPlayer['collection_status'];
export type FilterStatus = 'all' | CollectionStatus;
export type FilterDropdown = 'season' | 'collection' | 'club' | 'status' | 'position' | 'problem';
export type FilterOption = { label: string; value: string };

export const BREAKDOWN_LABELS: Record<string, string> = {
  starter: 'Titulaire',
  fullGameBonus: '+90 min',
  subEntered: 'Remplaçant entrant',
  goals: 'But(s)',
  assists: 'Passe(s) décisive(s)',
  shotsOn: 'Tir(s) cadré(s)',
  keyPasses: 'Passe(s) clé(s)',
  dribblesSuccess: 'Dribble(s) réussi(s)',
  foulDrawn: 'Faute(s) subie(s)',
  penaltyWon: 'Penalty obtenu',
  tackles: 'Tacle(s)',
  interceptions: 'Interception(s)',
  blocks: 'Tir(s) contré(s)',
  duelsWon: 'Duel(s) gagné(s)',
  duelsLost: 'Duel(s) perdu(s)',
  dribblesPast: 'Dribble(s) subi(s)',
  saves: 'Arrêt(s)',
  goalsConcededGK: 'But(s) encaissé(s)',
  penaltySaved: 'Penalty arrêté',
  foulsCommitted: 'Faute(s) commise(s)',
  yellowCards: 'Carton jaune',
  redCards: 'Carton rouge',
  penaltyCommitted: 'Penalty commis',
  penaltyMissed: 'Penalty raté',
  passAccuracy: 'Précision des passes',
  resultBonus: 'Résultat équipe',
  teamGoalsScored: 'Buts marqués (équipe)',
  teamGoalsConceded: 'Buts encaissés (équipe)',
};

export const RESULT_LABEL = { win: 'Victoire', draw: 'Nul', loss: 'Défaite' };
export const RESULT_COLOR = { win: '#4caf50', draw: '#e0a050', loss: '#e05c5c' };

export const COLLECTION_STATUS_LABEL: Record<CollectionStatus, string> = {
  active: 'Active',
  hidden: 'Hidden',
  legacy: 'Legacy',
};

export const COLLECTION_STATUS_COLOR: Record<CollectionStatus, string> = {
  active: '#4caf50',
  hidden: '#777777',
  legacy: '#E4BC66',
};

export type InfoValue = ReactNode;

export function isProblem(p: AdminPlayer, filter: FilterProblem): boolean {
  if (filter === 'all') return false;
  if (filter === 'base50') return p.base_score === 50;
  if (filter === 'no_scores') return p.score_count === 0 && p.collection_status === 'active';
  if (filter === 'base50_no_scores') return p.base_score === 50 && p.score_count === 0;
  if (filter === 'zero_minutes') return p.season_minutes === 0;
  return false;
}

export function matchesFilters(
  p: AdminPlayer,
  club: string,
  problem: FilterProblem,
  position: FilterPosition,
  status: FilterStatus
): boolean {
  if (club !== 'all' && p.club !== club) return false;
  if (problem !== 'all' && !isProblem(p, problem)) return false;
  if (position !== 'all' && p.position !== position) return false;
  if (status !== 'all' && p.collection_status !== status) return false;
  return true;
}
