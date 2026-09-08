-- ============================================================
-- Card artworks
-- Adds a dedicated generated card illustration URL while keeping
-- image_uri as the official/reference portrait.
-- ============================================================

ALTER TABLE players
ADD COLUMN IF NOT EXISTS card_art_uri text;

CREATE INDEX IF NOT EXISTS idx_players_card_art_missing
ON players (season, club, card_type)
WHERE card_art_uri IS NULL;

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
  get_rarity(up.duplicate_count)                                    AS rarity,
  ROUND(p.base_score * get_score_multiplier(up.duplicate_count), 2) AS boosted_score
FROM user_players up
JOIN players p ON p.id = up.player_id;
