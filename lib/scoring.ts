/**
 * Moteur de calcul fantasy JCC Football.
 *
 * Pour changer les points du bareme, edite `lib/scoring-config.ts`.
 * Ce fichier applique les regles, mais ne parle ni a Supabase ni a API Football.
 */

import { SCORING_CONFIG } from './scoring-config';

export { SCORING_CONFIG } from './scoring-config';

function n(val: number | null | undefined): number {
  return val ?? 0;
}

function calcPassAccuracyPoints(passesAccurate: number, passesTotal: number): number {
  if (passesTotal === 0) return 0;
  const pct = (passesAccurate / passesTotal) * 100;
  const tierIndex = pct < 50
    ? 0
    : Math.min(Math.floor((pct - 50) / 5) + 1, SCORING_CONFIG.passAccuracy.length - 1);
  return SCORING_CONFIG.passAccuracy[tierIndex];
}

function calcTeamGoalPoints(goals: number, table: readonly number[]): number {
  if (goals < table.length) return table[goals];

  let points = table[table.length - 1];
  const extraGoals = goals - (table.length - 1);
  for (let i = 0; i < extraGoals; i++) {
    points *= 2;
  }
  return points;
}

export interface PlayerScoreResult {
  score: number;
  breakdown: Record<string, number>;
}

export interface PlayerMatchStatsForScoring {
  minutesPlayed: number;
  isSubstitute: boolean;
  goals: number;
  assists: number;
  shotsOn: number;
  keyPasses: number;
  passesTotal: number;
  passesAccurate: number;
  tackles: number;
  interceptions: number;
  blocks: number;
  duelsTotal: number;
  duelsWon: number;
  dribblesSuccess: number;
  dribblesPast: number;
  foulsDrawn: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  goalsConceded: number;
  penaltyWon: number;
  penaltyCommitted: number;
  penaltyMissed: number;
  penaltySaved: number;
}

export type TeamResult = 'win' | 'draw' | 'loss';

export function calculatePlayerScore(
  stats: PlayerMatchStatsForScoring,
  teamGoalsScored: number,
  teamGoalsConceded: number,
  teamResult: TeamResult
): PlayerScoreResult {
  const cfg = SCORING_CONFIG;
  const breakdown: Record<string, number> = {};
  let score = 0;

  const add = (key: string, points: number) => {
    if (points === 0) return;
    breakdown[key] = (breakdown[key] ?? 0) + points;
    score += points;
  };

  if (stats.minutesPlayed > 0) {
    if (!stats.isSubstitute) {
      add('starter', cfg.participation.starter);
      if (stats.minutesPlayed >= cfg.participation.fullGameMinutes) {
        add('fullGameBonus', cfg.participation.fullGameBonus);
      }
    } else {
      add('subEntered', cfg.participation.subEntered);
    }
  }

  add('goals', n(stats.goals) * cfg.attack.goal);
  add('assists', n(stats.assists) * cfg.attack.assist);
  add('shotsOn', n(stats.shotsOn) * cfg.attack.shotOnTarget);
  add('keyPasses', n(stats.keyPasses) * cfg.attack.keyPass);
  add('dribblesSuccess', n(stats.dribblesSuccess) * cfg.attack.dribbleSuccess);
  add('foulDrawn', n(stats.foulsDrawn) * cfg.attack.foulDrawn);
  add('penaltyWon', n(stats.penaltyWon) * cfg.attack.penaltyWon);

  add('tackles', n(stats.tackles) * cfg.defense.tackle);
  add('interceptions', n(stats.interceptions) * cfg.defense.interception);
  add('blocks', n(stats.blocks) * cfg.defense.shotBlocked);
  add('duelsWon', n(stats.duelsWon) * cfg.defense.duelWon);
  add('duelsLost', Math.max(0, n(stats.duelsTotal) - n(stats.duelsWon)) * cfg.defense.duelLost);
  add('dribblesPast', n(stats.dribblesPast) * cfg.defense.dribblePast);

  add('saves', n(stats.saves) * cfg.goalkeeper.save);
  add('goalsConcededGK', n(stats.goalsConceded) * cfg.goalkeeper.goalConceded);
  add('penaltySaved', n(stats.penaltySaved) * cfg.goalkeeper.penaltySaved);

  add('foulsCommitted', n(stats.foulsCommitted) * cfg.sanctions.foulCommitted);
  add('yellowCards', n(stats.yellowCards) * cfg.sanctions.yellowCard);
  add('redCards', n(stats.redCards) * cfg.sanctions.redCard);
  add('penaltyCommitted', n(stats.penaltyCommitted) * cfg.sanctions.penaltyCommitted);
  add('penaltyMissed', n(stats.penaltyMissed) * cfg.sanctions.penaltyMissed);

  add('passAccuracy', calcPassAccuracyPoints(stats.passesAccurate, stats.passesTotal));

  add('resultBonus', cfg.collective.result[teamResult]);
  add('teamGoalsScored', calcTeamGoalPoints(teamGoalsScored, cfg.collective.goalsScored));
  add('teamGoalsConceded', calcTeamGoalPoints(teamGoalsConceded, cfg.collective.goalsConceded));

  return { score: Math.round(score * 100) / 100, breakdown };
}

export function applyRarityMultiplier(performanceScore: number, duplicateCount: number): number {
  const multipliers: Record<string, number> = {
    common: 1.00,
    typic: 1.10,
    rare: 1.25,
    epic: 1.45,
    legend: 1.70,
  };
  const thresholds = [
    { min: 20, rarity: 'legend' },
    { min: 10, rarity: 'epic' },
    { min: 5, rarity: 'rare' },
    { min: 2, rarity: 'typic' },
    { min: 1, rarity: 'common' },
  ];
  const rarity = thresholds.find(t => duplicateCount >= t.min)?.rarity ?? 'common';
  return Math.round(performanceScore * multipliers[rarity] * 100) / 100;
}
