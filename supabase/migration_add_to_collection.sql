-- ============================================================
-- Fonction : ajoute une carte à la collection de l'utilisateur
-- Si la carte existe déjà → incrémente duplicate_count
-- Si nouvelle → insère avec le count initial
-- SECURITY INVOKER : les RLS s'appliquent normalement
-- ============================================================

CREATE OR REPLACE FUNCTION add_to_collection(p_player_id uuid, p_add_count integer)
RETURNS void AS $$
BEGIN
  INSERT INTO user_players (user_id, player_id, duplicate_count)
  VALUES (auth.uid(), p_player_id, p_add_count)
  ON CONFLICT (user_id, player_id)
  DO UPDATE SET duplicate_count = user_players.duplicate_count + EXCLUDED.duplicate_count;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
