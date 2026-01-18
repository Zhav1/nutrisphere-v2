-- =============================================
-- NutriSphere Streak & Faint System Migration
-- Migration: 20250613_streak_faint_system.sql
-- =============================================
-- 
-- This migration implements:
-- 1. Streak tracking (last_cook_date, streak bonuses)
-- 2. True Zero HP + Faint state (revival mechanic)
-- 3. Streak Shield consumable item
-- 4. XP formula fix (recalculate max_xp for all users)
-- =============================================

-- =============================================
-- 1. PROFILES TABLE UPDATES
-- =============================================

-- Add streak tracking columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_cook_date DATE,
  ADD COLUMN IF NOT EXISTS streak_shield_active BOOLEAN DEFAULT FALSE;

-- Add faint state columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_fainted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS faint_recovery_count INTEGER DEFAULT 0;

-- =============================================
-- 2. UPDATE HEALTH CONSTRAINT (Allow True Zero)
-- =============================================

-- Remove old constraint that floors at 5
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_health_check;

-- Add new constraint allowing 0-100
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_health_check CHECK (health >= 0 AND health <= 100);

-- =============================================
-- 3. ADD GAME SETTINGS FOR STREAK & FAINT
-- =============================================

INSERT INTO public.game_settings (key, value, description) VALUES
  ('STREAK_BONUS_7DAYS', 10, 'XP bonus percentage at 7 day streak'),
  ('STREAK_BONUS_14DAYS', 20, 'XP bonus percentage at 14 day streak'),
  ('STREAK_BONUS_30DAYS', 50, 'XP bonus percentage at 30 day streak'),
  ('FAINT_RECOVERY_RECIPES', 3, 'Number of recipes to cook to revive from faint'),
  ('FAINT_REVIVE_HEALTH', 20, 'Starting HP after reviving from faint')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 4. CREATE STREAK SHIELD ACCESSORY
-- =============================================

-- Add 'consumable' to category check constraint
ALTER TABLE public.accessories
  DROP CONSTRAINT IF EXISTS accessories_category_check;

ALTER TABLE public.accessories
  ADD CONSTRAINT accessories_category_check 
  CHECK (category IN ('hat', 'outfit', 'background', 'pet', 'consumable'));

-- Insert Streak Shield item
INSERT INTO public.accessories (name, description, category, price_gold, is_available, required_level) VALUES
  ('Streak Shield', 'Melindungi streak kamu selama 1 hari tidak masak. Otomatis aktif saat dibutuhkan! 🛡️', 'consumable', 150, true, 1)
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. FIX XP FORMULA - RECALCULATE MAX_XP
-- =============================================

-- Exponential formula: 100 * 1.5^(level-1)
-- This ensures max_xp uses the correct exponential curve

UPDATE public.profiles
SET max_xp = FLOOR(100 * POWER(1.5, GREATEST(1, level) - 1))
WHERE max_xp != FLOOR(100 * POWER(1.5, GREATEST(1, level) - 1));

-- Also reset current_xp to 0 if it exceeds the new max_xp
-- (This prevents users from being "stuck" at high XP with new higher cap)
-- NOTE: Only do this if current_xp > max_xp after recalculation
UPDATE public.profiles
SET current_xp = 0
WHERE current_xp > FLOOR(100 * POWER(1.5, GREATEST(1, level) - 1));

-- =============================================
-- 6. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to calculate streak XP multiplier
CREATE OR REPLACE FUNCTION calculate_streak_xp_multiplier(p_streak_days INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  v_bonus_7 INTEGER;
  v_bonus_14 INTEGER;
  v_bonus_30 INTEGER;
BEGIN
  -- Get bonus values from settings
  SELECT value INTO v_bonus_7 FROM public.game_settings WHERE key = 'STREAK_BONUS_7DAYS';
  SELECT value INTO v_bonus_14 FROM public.game_settings WHERE key = 'STREAK_BONUS_14DAYS';
  SELECT value INTO v_bonus_30 FROM public.game_settings WHERE key = 'STREAK_BONUS_30DAYS';
  
  v_bonus_7 := COALESCE(v_bonus_7, 10);
  v_bonus_14 := COALESCE(v_bonus_14, 20);
  v_bonus_30 := COALESCE(v_bonus_30, 50);
  
  -- Return multiplier based on streak
  IF p_streak_days >= 30 THEN
    RETURN 1.0 + (v_bonus_30::NUMERIC / 100);
  ELSIF p_streak_days >= 14 THEN
    RETURN 1.0 + (v_bonus_14::NUMERIC / 100);
  ELSIF p_streak_days >= 7 THEN
    RETURN 1.0 + (v_bonus_7::NUMERIC / 100);
  ELSE
    RETURN 1.0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if date is yesterday
CREATE OR REPLACE FUNCTION is_yesterday(p_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_date = CURRENT_DATE - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 7. UPDATE HEALTH DECAY TO ALLOW TRUE ZERO
-- =============================================

-- Modify check_and_apply_health_decay to:
-- 1. Allow HP to reach 0
-- 2. Set is_fainted = true when HP reaches 0
-- 3. Use streak shield if available before resetting streak

CREATE OR REPLACE FUNCTION check_and_apply_health_decay(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_last_cook TIMESTAMPTZ;
  v_days_since_cook INTEGER;
  v_health_change INTEGER := 0;
  v_new_health INTEGER;
  v_is_fainted BOOLEAN := FALSE;
  v_streak_reset BOOLEAN := FALSE;
  v_shield_used BOOLEAN := FALSE;
  v_new_streak INTEGER;
  v_message TEXT := '';
  v_penalty_1day INTEGER;
  v_penalty_2plus INTEGER;
BEGIN
  -- Get profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN 
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  
  -- If already fainted, skip decay
  IF v_profile.is_fainted THEN
    RETURN jsonb_build_object(
      'message', 'User is fainted, no decay applied',
      'is_fainted', TRUE
    );
  END IF;
  
  -- Get penalty values from settings
  SELECT value INTO v_penalty_1day FROM public.game_settings WHERE key = 'HEALTH_PENALTY_1DAY';
  SELECT value INTO v_penalty_2plus FROM public.game_settings WHERE key = 'HEALTH_PENALTY_2PLUS_DAYS';
  
  v_penalty_1day := COALESCE(v_penalty_1day, 15);
  v_penalty_2plus := COALESCE(v_penalty_2plus, 25);
  
  -- Find last cook date
  SELECT MAX(cooked_at) INTO v_last_cook 
  FROM public.saved_recipes 
  WHERE user_id = p_user_id AND is_cooked = TRUE;
  
  -- If never cooked, use profile creation date
  IF v_last_cook IS NULL THEN
    v_last_cook := v_profile.created_at;
  END IF;
  
  -- Calculate days since last cook
  v_days_since_cook := EXTRACT(DAY FROM (NOW() - v_last_cook))::INTEGER;
  
  -- Apply health penalties based on inactivity
  IF v_days_since_cook >= 2 THEN
    v_health_change := -v_penalty_1day - (v_penalty_2plus * (v_days_since_cook - 1));
    v_message := format('Inactive %s days: %s HP', v_days_since_cook, v_health_change);
    
    -- Streak should reset, check for shield
    IF v_profile.streak_shield_active THEN
      v_shield_used := TRUE;
      v_new_streak := v_profile.streak_days; -- Keep streak
      v_message := v_message || ' (Shield protected streak!)';
    ELSE
      v_streak_reset := TRUE;
      v_new_streak := 0; -- Reset streak
    END IF;
  ELSIF v_days_since_cook = 1 THEN
    v_health_change := -v_penalty_1day;
    v_message := format('Missed yesterday: %s HP', v_health_change);
    v_new_streak := v_profile.streak_days; -- Keep streak for 1 day
  ELSE
    v_message := 'Active today, no penalty';
    v_new_streak := v_profile.streak_days;
  END IF;
  
  -- Calculate new health (allow true zero!)
  v_new_health := GREATEST(0, LEAST(100, v_profile.health + v_health_change));
  
  -- Check if fainted (HP = 0)
  IF v_new_health <= 0 THEN
    v_is_fainted := TRUE;
    v_new_health := 0;
    v_message := v_message || ' 💀 NutriGotchi PINGSAN!';
  END IF;
  
  -- Update profile
  UPDATE public.profiles SET
    health = v_new_health,
    mood = CASE
      WHEN v_is_fainted THEN 'sick'
      WHEN v_new_health >= 60 THEN 'happy'
      WHEN v_new_health >= 20 THEN 'neutral'
      ELSE 'sick'
    END,
    is_fainted = v_is_fainted,
    streak_days = v_new_streak,
    streak_shield_active = CASE WHEN v_shield_used THEN FALSE ELSE v_profile.streak_shield_active END,
    consecutive_inactive_days = v_days_since_cook,
    last_health_check_at = NOW()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'previous_health', v_profile.health,
    'new_health', v_new_health,
    'health_change', v_health_change,
    'inactive_days', v_days_since_cook,
    'is_fainted', v_is_fainted,
    'streak_reset', v_streak_reset,
    'shield_used', v_shield_used,
    'new_streak', v_new_streak,
    'mood', CASE 
      WHEN v_is_fainted THEN 'sick'
      WHEN v_new_health >= 60 THEN 'happy'
      WHEN v_new_health >= 20 THEN 'neutral'
      ELSE 'sick'
    END,
    'message', v_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. VERIFY MIGRATION
-- =============================================

-- Check new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('last_cook_date', 'streak_shield_active', 'is_fainted', 'faint_recovery_count');

-- Check Streak Shield exists
SELECT id, name, category, price_gold FROM public.accessories WHERE name = 'Streak Shield';

-- Check game settings
SELECT key, value, description FROM public.game_settings 
WHERE key LIKE 'STREAK%' OR key LIKE 'FAINT%';

-- =============================================
-- END OF MIGRATION
-- =============================================
