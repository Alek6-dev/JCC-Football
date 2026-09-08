-- Table de configuration globale de l'app
-- Modifier une valeur ici = effet immédiat sans déploiement
CREATE TABLE IF NOT EXISTS app_config (
  key   text PRIMARY KEY,
  value text NOT NULL
);

-- Valeurs par défaut
INSERT INTO app_config (key, value) VALUES
  ('max_daily_packs', '5')
ON CONFLICT (key) DO NOTHING;

-- RLS : lecture pour tous les users authentifiés, écriture service role uniquement
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_config_read" ON app_config;
CREATE POLICY "app_config_read" ON app_config FOR SELECT TO authenticated USING (true);

-- Mise à jour de use_free_pack() pour lire max_daily_packs depuis app_config
CREATE OR REPLACE FUNCTION use_free_pack()
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_remaining  integer;
  v_reset_date date;
  v_max        integer;
  today        date := current_date;
BEGIN
  SELECT value::integer INTO v_max FROM app_config WHERE key = 'max_daily_packs';
  v_max := COALESCE(v_max, 2);

  SELECT remaining, reset_date
    INTO v_remaining, v_reset_date
    FROM user_daily_packs
   WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    INSERT INTO user_daily_packs (user_id, remaining, reset_date)
    VALUES (auth.uid(), v_max - 1, today);
    RETURN v_max - 1;
  END IF;

  IF v_reset_date < today THEN
    v_remaining := v_max;
  END IF;

  IF v_remaining <= 0 THEN
    RETURN -1;
  END IF;

  UPDATE user_daily_packs
     SET remaining = v_remaining - 1, reset_date = today
   WHERE user_id = auth.uid();

  RETURN v_remaining - 1;
END;
$$;

-- Mise à jour de get_free_packs_remaining() pour lire le max depuis app_config
CREATE OR REPLACE FUNCTION get_free_packs_remaining()
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_remaining  integer;
  v_reset_date date;
  v_max        integer;
BEGIN
  SELECT value::integer INTO v_max FROM app_config WHERE key = 'max_daily_packs';
  v_max := COALESCE(v_max, 2);

  SELECT remaining, reset_date
    INTO v_remaining, v_reset_date
    FROM user_daily_packs
   WHERE user_id = auth.uid();

  IF NOT FOUND THEN RETURN v_max; END IF;
  IF v_reset_date < current_date THEN RETURN v_max; END IF;
  RETURN v_remaining;
END;
$$;
