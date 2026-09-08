-- ============================================================
-- Fonction RPC pour l'agrégation des scores côté admin
-- Évite la limite 1000 lignes de PostgREST en agrégeant en SQL
-- ============================================================

CREATE OR REPLACE FUNCTION admin_score_stats(p_season text DEFAULT '2025-26')
RETURNS TABLE(
  player_id  uuid,
  score_count bigint,
  avg_score  numeric,
  min_score  numeric,
  max_score  numeric
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    player_id,
    COUNT(*)                               AS score_count,
    ROUND(AVG(performance_score)::numeric, 1) AS avg_score,
    MIN(performance_score)                 AS min_score,
    MAX(performance_score)                 AS max_score
  FROM matchday_player_scores
  WHERE season = p_season
  GROUP BY player_id;
$$;
