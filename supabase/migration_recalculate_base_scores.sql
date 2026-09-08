-- Recalcule base_score de tous les joueurs d'une saison en une seule requête SQL.
-- Groupe par api_football_id pour couvrir les joueurs transférés (même api_football_id, plusieurs rows).

CREATE OR REPLACE FUNCTION recalculate_base_scores(p_season text DEFAULT '2025-26')
RETURNS void
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  UPDATE players p
  SET base_score = ROUND(
    (
      SELECT AVG(mps.performance_score)
      FROM matchday_player_scores mps
      JOIN players p2 ON p2.id = mps.player_id
      WHERE mps.season = p_season
        AND p2.api_football_id = p.api_football_id
    )::numeric,
    2
  )
  WHERE p.season = p_season
    AND p.card_type = 'player'
    AND p.api_football_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM matchday_player_scores mps
      JOIN players p2 ON p2.id = mps.player_id
      WHERE mps.season = p_season
        AND p2.api_football_id = p.api_football_id
    );
$$;
