-- ============================================================
-- JCC Football - Schema v1
-- À coller dans Supabase > SQL Editor > New query
-- ============================================================

-- Nettoyage si tu veux repartir de zéro
DROP TABLE IF EXISTS user_players CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP FUNCTION IF EXISTS get_rarity(integer);
DROP FUNCTION IF EXISTS get_score_multiplier(integer);


-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Rareté calculée depuis le nombre de doublons
CREATE OR REPLACE FUNCTION get_rarity(duplicate_count integer)
RETURNS text AS $$
BEGIN
  IF    duplicate_count >= 20 THEN RETURN 'legend';
  ELSIF duplicate_count >= 10 THEN RETURN 'epic';
  ELSIF duplicate_count >= 5  THEN RETURN 'rare';
  ELSIF duplicate_count >= 2  THEN RETURN 'typic';
  ELSE                             RETURN 'common';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Multiplicateur de score selon le nombre de doublons
CREATE OR REPLACE FUNCTION get_score_multiplier(duplicate_count integer)
RETURNS numeric AS $$
BEGIN
  IF    duplicate_count >= 20 THEN RETURN 1.70;
  ELSIF duplicate_count >= 10 THEN RETURN 1.45;
  ELSIF duplicate_count >= 5  THEN RETURN 1.25;
  ELSIF duplicate_count >= 2  THEN RETURN 1.10;
  ELSE                             RETURN 1.00;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================
-- TABLE PLAYERS (catalogue statique)
-- ============================================================

CREATE TABLE players (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text    NOT NULL,
  club         text    NOT NULL,
  position     text    NOT NULL CHECK (position IN ('ATT', 'MIL', 'DEF', 'GK')),
  base_score   numeric(4,2) NOT NULL DEFAULT 5.00,
  drop_weight  integer NOT NULL DEFAULT 50 CHECK (drop_weight BETWEEN 1 AND 100),
  image_uri    text,
  season       text    NOT NULL DEFAULT '2024-25',
  created_at   timestamptz DEFAULT now()
);

-- Lecture publique pour tous les users authentifiés
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_read" ON players
  FOR SELECT TO authenticated USING (true);


-- ============================================================
-- TABLE USER_PLAYERS (collection de l'utilisateur)
-- ============================================================

CREATE TABLE user_players (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id           uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  duplicate_count     integer NOT NULL DEFAULT 1 CHECK (duplicate_count >= 1),
  contract_expires_at timestamptz,
  obtained_at         timestamptz DEFAULT now(),
  UNIQUE (user_id, player_id)
);

ALTER TABLE user_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_players_owner" ON user_players
  FOR ALL TO authenticated USING (user_id = auth.uid());


-- ============================================================
-- VUE user_collection (lecture simplifiée côté app)
-- ============================================================

CREATE OR REPLACE VIEW user_collection AS
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
  get_rarity(up.duplicate_count)                                    AS rarity,
  ROUND(p.base_score * get_score_multiplier(up.duplicate_count), 2) AS boosted_score
FROM user_players up
JOIN players p ON p.id = up.player_id;


-- ============================================================
-- SEED - Quelques joueurs de test (Ligue 1)
-- ============================================================

INSERT INTO players (name, club, position, base_score, drop_weight) VALUES
  ('Mike Maignan',        'Paris',      'GK',  6.8, 80),
  ('William Saliba',      'Marseille',  'DEF', 7.1, 75),
  ('Ousmane Dembele',     'Paris',      'ATT', 7.4, 70),
  ('Alexandre Lacazette', 'Lyon',       'ATT', 6.5, 65),
  ('Mason Greenwood',     'Marseille',  'ATT', 7.0, 70),
  ('Khephren Thuram',     'Nice',       'MIL', 6.3, 60),
  ('Jonathan Clauss',     'Marseille',  'DEF', 6.2, 55),
  ('Elye Wahi',           'Lens',       'ATT', 5.9, 50),
  ('Baptiste Santamaria', 'Rennes',     'MIL', 5.5, 40),
  ('Mostafa Mohamed',     'Nantes',     'ATT', 5.2, 30);
