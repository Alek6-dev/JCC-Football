-- ============================================================
-- Système de packs gratuits quotidiens (2/jour)
-- ============================================================

CREATE TABLE user_daily_packs (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  remaining    integer NOT NULL DEFAULT 2,
  reset_date   date    NOT NULL DEFAULT current_date
);

ALTER TABLE user_daily_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_packs_owner" ON user_daily_packs
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Fonction : tente d'utiliser un pack gratuit
-- Retourne le nombre de packs restants après usage, -1 si épuisé
-- ============================================================
CREATE OR REPLACE FUNCTION use_free_pack()
RETURNS integer AS $$
DECLARE
  v_remaining  integer;
  v_reset_date date;
  today        date := current_date;
BEGIN
  SELECT remaining, reset_date
  INTO v_remaining, v_reset_date
  FROM user_daily_packs
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Première ouverture : on crée la ligne et on utilise 1 pack
    INSERT INTO user_daily_packs (user_id, remaining, reset_date)
    VALUES (auth.uid(), 1, today);
    RETURN 1;
  END IF;

  -- Nouveau jour → reset à 2
  IF v_reset_date < today THEN
    v_remaining := 2;
  END IF;

  IF v_remaining <= 0 THEN
    RETURN -1; -- plus de packs dispo
  END IF;

  UPDATE user_daily_packs
  SET remaining = v_remaining - 1, reset_date = today
  WHERE user_id = auth.uid();

  RETURN v_remaining - 1;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ============================================================
-- Fonction : consulte les packs restants sans en utiliser
-- ============================================================
CREATE OR REPLACE FUNCTION get_free_packs_remaining()
RETURNS integer AS $$
DECLARE
  v_remaining  integer;
  v_reset_date date;
BEGIN
  SELECT remaining, reset_date
  INTO v_remaining, v_reset_date
  FROM user_daily_packs
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN RETURN 2; END IF;
  IF v_reset_date < current_date THEN RETURN 2; END IF;
  RETURN v_remaining;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
