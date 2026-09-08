-- ============================================================
-- Editorial collection status
-- active   = visible in collection and packs
-- hidden   = kept in DB but hidden from collection and packs
-- archived = historical/old-season card kept for records
-- ============================================================

ALTER TABLE players
ADD COLUMN IF NOT EXISTS collection_status text NOT NULL DEFAULT 'active';

ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_collection_status_check;

ALTER TABLE players
ADD CONSTRAINT players_collection_status_check
CHECK (collection_status IN ('active', 'hidden', 'archived'));

CREATE INDEX IF NOT EXISTS idx_players_collection_status
ON players (season, club, card_type, collection_status);

DROP VIEW IF EXISTS user_collection;

CREATE VIEW user_collection AS
SELECT
  up.id,
  up.user_id,
  up.duplicate_count,
  up.contract_expires_at,
  up.obtained_at,
  p.id            AS player_id,
  p.name,
  p.club,
  p.position,
  p.base_score,
  p.image_uri,
  p.season,
  p.card_art_uri,
  p.collection_status,
  get_rarity(up.duplicate_count)                                    AS rarity,
  ROUND(p.base_score * get_score_multiplier(up.duplicate_count), 2) AS boosted_score
FROM user_players up
JOIN players p ON p.id = up.player_id;
