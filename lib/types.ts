import type { Rarity } from '@/components/PlayerCard';

export type CollectionStatus = 'active' | 'hidden' | 'legacy';

export type SeasonStatus = 'draft' | 'live' | 'archived';

export type Season = {
  id: string;
  season: string;
  name: string;
  status: SeasonStatus;
  starts_on: string | null;
  ends_on: string | null;
};

export type CardCollection = {
  id: string;
  season_id: string;
  code: string;
  name: string;
  type: 'base' | 'special' | 'winter' | 'archive';
  is_primary: boolean;
  pack_enabled: boolean;
  archive_pack_enabled: boolean;
};

export type Player = {
  id: string;
  name: string;
  club: string;
  position: string;
  card_type: 'badge' | 'player' | 'coach';
  base_score: number;
  drop_weight: number;
  club_letter: string | null;
  club_card_number: number | null;
  image_uri: string | null;
  card_art_uri: string | null;
  collection_status: CollectionStatus;
  season: string;
  collection_id: string | null;
  api_football_id: number | null;
  birth_year: number | null;
  season_minutes: number;
};

// Résultat de la vue user_collection
export type CollectionEntry = {
  id: string;
  user_id: string;
  player_id: string;
  name: string;
  club: string;
  position: string;
  base_score: number;
  boosted_score: number;
  image_uri: string | null;
  card_art_uri: string | null;
  collection_status: CollectionStatus;
  collection_id: string | null;
  collection_name: string | null;
  rarity: Rarity;
  duplicate_count: number;
  contract_expires_at: string | null;
  obtained_at: string;
  season: string;
};
