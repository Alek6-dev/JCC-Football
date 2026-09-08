-- ============================================================
-- JCC Football - Migration scoring + API Football
-- ============================================================

-- ------------------------------------------------------------
-- 1. Mise à jour table players
-- ------------------------------------------------------------

-- Lien vers l'ID joueur chez API Football (pour fetch les stats)
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS api_football_id integer;

-- Index pour lookup rapide lors du matching
CREATE INDEX IF NOT EXISTS idx_players_api_football_id
  ON players(api_football_id);

-- Correction saison courante
ALTER TABLE players
  ALTER COLUMN season SET DEFAULT '2025-26';

-- Minutes cumulées sur la saison (mis à jour par le backfill et après chaque journée)
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS season_minutes integer NOT NULL DEFAULT 0;

-- Année de naissance (pour le filtre d'éligibilité affichage/pack)
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS birth_year integer;

-- Règle d'éligibilité affichage/pack (calculée côté app ou vue) :
--   (birth_year IS NULL OR (EXTRACT(YEAR FROM NOW()) - birth_year) > 20)
--   OR season_minutes >= 1
-- Les joueurs non éligibles sont en DB mais masqués en collection et exclus des packs.

-- ------------------------------------------------------------
-- 2. Stats brutes par match (cache API Football)
--    Une ligne = un joueur pour un match donné
--    Stocke le payload complet pour pouvoir recalculer si besoin
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS matchday_player_stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  api_fixture_id  integer NOT NULL,
  matchday        integer NOT NULL,
  season          text    NOT NULL DEFAULT '2025-26',
  -- Données brutes du match (payload API Football complet)
  raw_stats       jsonb   NOT NULL,
  -- Snapshot des champs utilisés pour le calcul (dénormalisé pour lisibilité)
  minutes_played  integer,
  is_substitute   boolean,
  goals           integer DEFAULT 0,
  assists         integer DEFAULT 0,
  shots_on        integer DEFAULT 0,
  key_passes      integer DEFAULT 0,
  passes_total    integer DEFAULT 0,
  passes_accurate integer DEFAULT 0,  -- c'est un nb, pas un %, cf. API Football
  tackles         integer DEFAULT 0,
  interceptions   integer DEFAULT 0,
  blocks          integer DEFAULT 0,
  duels_total     integer DEFAULT 0,
  duels_won       integer DEFAULT 0,
  dribbles_success integer DEFAULT 0,
  dribbles_past   integer DEFAULT 0,
  fouls_drawn     integer DEFAULT 0,
  fouls_committed integer DEFAULT 0,
  yellow_cards    integer DEFAULT 0,
  red_cards       integer DEFAULT 0,
  saves           integer DEFAULT 0,   -- gardien uniquement
  goals_conceded  integer DEFAULT 0,   -- gardien uniquement
  penalty_won     integer DEFAULT 0,
  penalty_committed integer DEFAULT 0,
  penalty_scored  integer DEFAULT 0,
  penalty_missed  integer DEFAULT 0,
  penalty_saved   integer DEFAULT 0,   -- gardien uniquement
  fetched_at      timestamptz DEFAULT now(),
  UNIQUE (player_id, api_fixture_id)
);

-- Index pour requêtes par journée/saison
CREATE INDEX IF NOT EXISTS idx_mps_matchday_season
  ON matchday_player_stats(matchday, season);

CREATE INDEX IF NOT EXISTS idx_mps_player
  ON matchday_player_stats(player_id);

-- RLS : lecture authentifiée, écriture service_role uniquement
ALTER TABLE matchday_player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mps_read" ON matchday_player_stats
  FOR SELECT TO authenticated USING (true);
-- Les insertions/mises à jour ne passent que par service_role (server-side)

-- ------------------------------------------------------------
-- 3. Scores calculés par joueur par match
--    Résultat du calcul barème appliqué aux stats brutes
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS matchday_player_scores (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id           uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  matchday            integer NOT NULL,
  season              text    NOT NULL DEFAULT '2025-26',
  -- Score individuel avant multiplicateur rareté
  performance_score   numeric(7,2) NOT NULL DEFAULT 0,
  -- Détail ligne par ligne du calcul (pour debug et affichage futur)
  breakdown           jsonb,
  -- Données d'équipe utilisées pour les bonus collectifs
  team_goals_scored   integer NOT NULL DEFAULT 0,
  team_goals_conceded integer NOT NULL DEFAULT 0,
  team_result         text CHECK (team_result IN ('win', 'draw', 'loss')),
  calculated_at       timestamptz DEFAULT now(),
  UNIQUE (player_id, matchday, season)
);

CREATE INDEX IF NOT EXISTS idx_mpsc_matchday_season
  ON matchday_player_scores(matchday, season);

ALTER TABLE matchday_player_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mpsc_read" ON matchday_player_scores
  FOR SELECT TO authenticated USING (true);

-- ------------------------------------------------------------
-- 4. Fonction utilitaire : moyenne de score d'un joueur
--    Utilisée pour afficher le base_score "réel" sur les cartes
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_player_avg_score(p_player_id uuid, p_season text)
RETURNS numeric AS $$
  SELECT COALESCE(ROUND(AVG(performance_score), 2), 0)
  FROM matchday_player_scores
  WHERE player_id = p_player_id AND season = p_season;
$$ LANGUAGE sql STABLE SECURITY INVOKER;
