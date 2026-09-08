import type { Rarity } from '@/components/PlayerCard';
import type { Player } from '@/lib/types';

// Seuils de doublons pour chaque rareté
const RARITY_THRESHOLDS: { min: number; rarity: Rarity }[] = [
  { min: 20, rarity: 'legend' },
  { min: 10, rarity: 'epic' },
  { min: 5,  rarity: 'rare' },
  { min: 2,  rarity: 'typic' },
  { min: 1,  rarity: 'common' },
];

const SCORE_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.00,
  typic:  1.10,
  rare:   1.25,
  epic:   1.45,
  legend: 1.70,
};

export function getRarity(duplicateCount: number): Rarity {
  return RARITY_THRESHOLDS.find(t => duplicateCount >= t.min)!.rarity;
}

export function getScoreMultiplier(duplicateCount: number): number {
  return SCORE_MULTIPLIERS[getRarity(duplicateCount)];
}

export function getBoostedScore(baseScore: number, duplicateCount: number): number {
  return Math.round(baseScore * getScoreMultiplier(duplicateCount) * 100) / 100;
}

// Rareté initiale d'une carte à l'ouverture d'un pack
// common: 89%, typic: 10%, rare: 1% — pas d'epic/legend en pack
export function rollPackRarity(): Rarity {
  const roll = Math.random() * 100;
  if (roll < 1)  return 'rare';
  if (roll < 11) return 'typic';
  return 'common';
}

// duplicateCount de départ selon la rareté droppée
const RARITY_INITIAL_DUPLICATES: Record<Rarity, number> = {
  common: 1,
  typic:  2,
  rare:   5,
  epic:   10,
  legend: 20,
};

export function rarityToInitialDuplicates(rarity: Rarity): number {
  return RARITY_INITIAL_DUPLICATES[rarity];
}

/**
 * Filtre les joueurs éligibles pour l'affichage collection et les packs.
 * Règle : au moins 1 minute jouée cette saison.
 * Les joueurs non éligibles sont en DB mais masqués.
 */
export function filterEligiblePlayers(players: Player[]): Player[] {
  return players.filter(p => (p.collection_status ?? 'active') === 'active');
}

export function filterCollectionPlayers(players: Player[], ownedIds: Set<string>): Player[] {
  return players.filter(p => {
    const status = p.collection_status ?? 'active';
    return status === 'active' || (status === 'legacy' && ownedIds.has(p.id));
  });
}

// Tire N joueurs depuis le catalogue en respectant les drop_weight
export function drawPlayers(catalog: Player[], count: number): Player[] {
  const totalWeight = catalog.reduce((sum, p) => sum + p.drop_weight, 0);
  const result: Player[] = [];

  for (let i = 0; i < count; i++) {
    let rand = Math.random() * totalWeight;
    for (const player of catalog) {
      rand -= player.drop_weight;
      if (rand <= 0) {
        result.push(player);
        break;
      }
    }
  }

  return result;
}
