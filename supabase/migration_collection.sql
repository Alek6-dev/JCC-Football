-- ============================================================
-- Migration : numérotation collection par club
-- Remplace collection_number global par club_letter + club_card_number
-- Exemple : Angers A1 (badge), A2 (GK), ..., A22 (coach)
-- ============================================================

-- Ajout des colonnes
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS card_type text NOT NULL DEFAULT 'player'
    CHECK (card_type IN ('badge', 'player', 'coach')),
  ADD COLUMN IF NOT EXISTS club_letter      text,
  ADD COLUMN IF NOT EXISTS club_card_number integer;

-- Index pour tri et unicité
CREATE UNIQUE INDEX IF NOT EXISTS players_club_card_idx
  ON players (club_letter, club_card_number);
