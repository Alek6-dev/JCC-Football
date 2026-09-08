-- ============================================================
-- Migration : sécurisation RLS après ajout auth
-- ============================================================

-- players : lecture pour les utilisateurs connectés uniquement
-- (on retire l'accès anon si il avait été ajouté en dev)
DROP POLICY IF EXISTS "players_read" ON players;
CREATE POLICY "players_read" ON players
  FOR SELECT TO authenticated USING (true);

-- user_players : déjà bon (owner uniquement via auth.uid())
-- On s'assure juste que les policies sont en place
DROP POLICY IF EXISTS "user_players_owner" ON user_players;
CREATE POLICY "user_players_owner" ON user_players
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
