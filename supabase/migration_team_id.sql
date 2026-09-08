-- ============================================================
-- Migration : ajout api_football_team_id sur players
-- Nécessaire pour distinguer les joueurs en prêt (même api_football_id, clubs différents)
-- ============================================================

ALTER TABLE players ADD COLUMN IF NOT EXISTS api_football_team_id INTEGER;

-- Index pour le lookup dans le pipeline de scoring
CREATE INDEX IF NOT EXISTS idx_players_api_ids
  ON players(api_football_id, api_football_team_id);
