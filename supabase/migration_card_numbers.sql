-- ============================================================
-- Migration : numérotation des cartes + correction base_score
-- ============================================================

-- 1. Correction base_score pour joueurs sans minutes jouées
--    (backfill ne les a pas calculés → ils restent à 50 par défaut)
UPDATE players
SET base_score = 0
WHERE card_type = 'player'
  AND season_minutes = 0
  AND season = '2025-26';

-- 2. Assignation des club_letter (ordre alphabétique des clubs)
WITH club_letters AS (
  SELECT
    club,
    CHR(64 + ROW_NUMBER() OVER (ORDER BY club)::integer) AS letter
  FROM (SELECT DISTINCT club FROM players WHERE season = '2025-26') clubs
)
UPDATE players p
SET club_letter = cl.letter
FROM club_letters cl
WHERE p.club = cl.club
  AND p.season = '2025-26';

-- 3. Numérotation des cartes par club
--    Badge = 1
--    Joueurs = 2..N (ordre : GK, DEF, MIL, ATT, puis alphabétique)
--    (pas de coach dans le seed 2025-26)
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY club
      ORDER BY
        CASE card_type WHEN 'badge' THEN 0 ELSE 1 END,
        CASE position
          WHEN 'GK'  THEN 1
          WHEN 'DEF' THEN 2
          WHEN 'MIL' THEN 3
          WHEN 'ATT' THEN 4
          ELSE 5
        END,
        name
    ) AS num
  FROM players
  WHERE season = '2025-26'
)
UPDATE players p
SET club_card_number = n.num
FROM numbered n
WHERE p.id = n.id;
