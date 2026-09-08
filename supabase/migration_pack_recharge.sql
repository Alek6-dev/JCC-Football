-- ============================================================
-- Recharge packs gratuits : 1 pack toutes les 10h, stock max 2
-- ============================================================

ALTER TABLE user_daily_packs
ADD COLUMN IF NOT EXISTS last_refill_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION normalize_free_pack_state(
  p_remaining integer,
  p_last_refill_at timestamptz
)
RETURNS TABLE (
  remaining integer,
  last_refill_at timestamptz
) AS $$
DECLARE
  v_max integer := 2;
  v_interval interval := interval '10 hours';
  v_elapsed_intervals integer;
BEGIN
  remaining := LEAST(v_max, GREATEST(0, COALESCE(p_remaining, v_max)));
  last_refill_at := COALESCE(p_last_refill_at, now());

  IF remaining >= v_max THEN
    RETURN NEXT;
    RETURN;
  END IF;

  v_elapsed_intervals := FLOOR(EXTRACT(EPOCH FROM (now() - last_refill_at)) / EXTRACT(EPOCH FROM v_interval));

  IF v_elapsed_intervals > 0 THEN
    remaining := LEAST(v_max, remaining + v_elapsed_intervals);
    last_refill_at := last_refill_at + (v_elapsed_intervals * v_interval);
  END IF;

  IF remaining >= v_max THEN
    last_refill_at := now();
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_free_pack_status()
RETURNS jsonb AS $$
DECLARE
  v_remaining integer;
  v_last_refill_at timestamptz;
  v_norm record;
  v_max integer := 2;
  v_interval interval := interval '10 hours';
  v_next_pack_at timestamptz;
  v_seconds_until_next integer := 0;
  v_progress numeric := 1;
BEGIN
  SELECT udp.remaining, udp.last_refill_at
  INTO v_remaining, v_last_refill_at
  FROM user_daily_packs udp
  WHERE udp.user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO user_daily_packs (user_id, remaining, reset_date, last_refill_at)
    VALUES (auth.uid(), v_max, current_date, now());
    v_remaining := v_max;
    v_last_refill_at := now();
  END IF;

  SELECT *
  INTO v_norm
  FROM normalize_free_pack_state(v_remaining, v_last_refill_at);

  UPDATE user_daily_packs
  SET remaining = v_norm.remaining,
      reset_date = current_date,
      last_refill_at = v_norm.last_refill_at
  WHERE user_id = auth.uid();

  IF v_norm.remaining < v_max THEN
    v_next_pack_at := v_norm.last_refill_at + v_interval;
    v_seconds_until_next := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (v_next_pack_at - now())))::integer);
    v_progress := LEAST(1, GREATEST(0, EXTRACT(EPOCH FROM (now() - v_norm.last_refill_at)) / EXTRACT(EPOCH FROM v_interval)));
  END IF;

  RETURN jsonb_build_object(
    'remaining', v_norm.remaining,
    'max', v_max,
    'next_pack_at', CASE WHEN v_norm.remaining < v_max THEN v_next_pack_at ELSE NULL END,
    'seconds_until_next', v_seconds_until_next,
    'recharge_progress', v_progress
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE OR REPLACE FUNCTION use_free_pack()
RETURNS integer AS $$
DECLARE
  v_status jsonb;
  v_remaining integer;
  v_max integer := 2;
BEGIN
  v_status := get_free_pack_status();
  v_remaining := (v_status->>'remaining')::integer;

  IF v_remaining <= 0 THEN
    RETURN -1;
  END IF;

  UPDATE user_daily_packs
  SET remaining = v_remaining - 1,
      reset_date = current_date,
      last_refill_at = CASE
        WHEN v_remaining = v_max THEN now()
        ELSE last_refill_at
      END
  WHERE user_id = auth.uid();

  RETURN v_remaining - 1;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

CREATE OR REPLACE FUNCTION get_free_packs_remaining()
RETURNS integer AS $$
DECLARE
  v_status jsonb;
BEGIN
  v_status := get_free_pack_status();
  RETURN (v_status->>'remaining')::integer;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
