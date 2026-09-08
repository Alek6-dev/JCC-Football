-- ============================================================
-- Seasons and collections
-- A season owns one or more collections. Cards stay linked to a
-- collection while players.season remains as a compatibility field.
-- ============================================================

CREATE TABLE IF NOT EXISTS seasons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season    text NOT NULL UNIQUE,
  name      text NOT NULL,
  status    text NOT NULL DEFAULT 'draft',
  starts_on date,
  ends_on   date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seasons_status_check CHECK (status IN ('draft', 'live', 'archived'))
);

CREATE UNIQUE INDEX IF NOT EXISTS seasons_one_live_idx
ON seasons ((status))
WHERE status = 'live';

CREATE TABLE IF NOT EXISTS collections (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  code       text NOT NULL,
  name       text NOT NULL,
  type       text NOT NULL DEFAULT 'base',
  is_primary boolean NOT NULL DEFAULT false,
  pack_enabled boolean NOT NULL DEFAULT true,
  archive_pack_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_type_check CHECK (type IN ('base', 'special', 'winter', 'archive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS collections_unique_code_per_season_idx
ON collections (season_id, code);

CREATE UNIQUE INDEX IF NOT EXISTS collections_one_primary_per_season_idx
ON collections (season_id)
WHERE is_primary;

INSERT INTO seasons (season, name, status, starts_on, ends_on)
VALUES ('2025-26', 'Ligue 1 2025-26', 'live', DATE '2025-08-01', DATE '2026-06-30')
ON CONFLICT (season) DO UPDATE
SET name = EXCLUDED.name,
    status = CASE WHEN seasons.status = 'draft' THEN EXCLUDED.status ELSE seasons.status END,
    starts_on = COALESCE(seasons.starts_on, EXCLUDED.starts_on),
    ends_on = COALESCE(seasons.ends_on, EXCLUDED.ends_on),
    updated_at = now();

INSERT INTO collections (season_id, code, name, type, is_primary, pack_enabled, archive_pack_enabled)
SELECT s.id, 'ligue1-2025-26', 'Ligue 1 2025-26', 'base', true, true, false
FROM seasons s
WHERE s.season = '2025-26'
ON CONFLICT (season_id, code) DO UPDATE
SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    is_primary = EXCLUDED.is_primary,
    pack_enabled = EXCLUDED.pack_enabled,
    updated_at = now();

ALTER TABLE players
ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES collections(id);

UPDATE players p
SET collection_id = c.id
FROM collections c
JOIN seasons s ON s.id = c.season_id
WHERE p.collection_id IS NULL
  AND p.season = s.season
  AND c.is_primary = true;

ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_collection_status_check;

UPDATE players
SET collection_status = 'legacy'
WHERE collection_status = 'archived';

ALTER TABLE players
ADD CONSTRAINT players_collection_status_check
CHECK (collection_status IN ('active', 'hidden', 'legacy'));

CREATE INDEX IF NOT EXISTS idx_players_collection_id
ON players (collection_id, club, card_type, collection_status);

CREATE INDEX IF NOT EXISTS idx_players_live_compat
ON players (season, club, card_type, collection_status);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seasons_read" ON seasons;
CREATE POLICY "seasons_read" ON seasons
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "collections_read" ON collections;
CREATE POLICY "collections_read" ON collections
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION get_live_collection_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT c.id
  FROM collections c
  JOIN seasons s ON s.id = c.season_id
  WHERE s.status = 'live'
    AND c.is_primary = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_live_season()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT season
  FROM seasons
  WHERE status = 'live'
  LIMIT 1;
$$;

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
  p.collection_id,
  c.name          AS collection_name,
  p.card_art_uri,
  p.collection_status,
  get_rarity(up.duplicate_count)                                    AS rarity,
  ROUND(p.base_score * get_score_multiplier(up.duplicate_count), 2) AS boosted_score
FROM user_players up
JOIN players p ON p.id = up.player_id
LEFT JOIN collections c ON c.id = p.collection_id;
