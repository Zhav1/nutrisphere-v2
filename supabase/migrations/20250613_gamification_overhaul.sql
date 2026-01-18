-- =============================================
-- NutriSphere Gamification System Overhaul
-- Migration: 20250613_gamification_overhaul.sql
-- =============================================
-- 
-- This migration implements:
-- 1. Recipe reward locking (earn XP/Gold only on "cook")
-- 2. Daily cook limits (5 per day)
-- 3. Exponential XP scaling (unlimited levels)
-- 4. Strict health decay penalties
-- =============================================

-- =============================================
-- 1. SAVED_RECIPES TABLE UPDATES
-- =============================================

-- Add columns for cook tracking and reward storage
ALTER TABLE public.saved_recipes 
  ADD COLUMN IF NOT EXISTS is_cooked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cooked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gold_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- Index for filtering cooked recipes
CREATE INDEX IF NOT EXISTS idx_saved_recipes_cooked 
  ON public.saved_recipes(is_cooked) WHERE is_cooked = TRUE;

-- Index for finding recipes by cook date
CREATE INDEX IF NOT EXISTS idx_saved_recipes_cooked_at 
  ON public.saved_recipes(cooked_at DESC) WHERE cooked_at IS NOT NULL;

-- =============================================
-- 2. PROFILES TABLE UPDATES
-- =============================================

-- Add columns for daily limits and health tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_cook_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_cook_reset_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS last_health_check_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS consecutive_inactive_days INTEGER DEFAULT 0;

-- Remove max_xp constraint to allow unlimited exponential scaling
-- The old constraint was: CHECK (max_xp >= 100)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_max_xp_check;

-- Add new constraint that allows any positive value
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_max_xp_check CHECK (max_xp > 0);

-- Update health constraint to have minimum of 5 (never fully dead)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_health_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_health_check CHECK (health >= 5 AND health <= 100);

-- =============================================
-- 3. EXPONENTIAL XP FORMULA FUNCTION
-- =============================================

-- Formula: 100 * 1.5^(level-1)
-- Level 1: 100 XP to level up
-- Level 5: 506 XP to level up
-- Level 10: 3844 XP to level up
-- Level 20: 221,679 XP to level up (very hard!)
CREATE OR REPLACE FUNCTION calculate_max_xp(p_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(100 * POWER(1.5, GREATEST(1, p_level) - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 4. DAILY COOK LIMIT CONSTANTS
-- =============================================

-- Create a settings table for game constants (if not exists)
CREATE TABLE IF NOT EXISTS public.game_settings (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.game_settings (key, value, description) VALUES
  ('DAILY_COOK_LIMIT', 5, 'Maximum recipes that grant XP/Gold per day'),
  ('HEALTH_PENALTY_1DAY', 15, 'HP lost for missing 1 day'),
  ('HEALTH_PENALTY_2PLUS_DAYS', 25, 'HP lost per day after 2+ days inactive'),
  ('HEALTH_RECOVERY_COOK', 8, 'HP gained from cooking a recipe'),
  ('HEALTH_RECOVERY_SCAN_GOOD', 10, 'HP gained from scanning A/B grade food'),
  ('SICK_MODE_XP_MULTIPLIER', 75, 'XP percentage when HP <= 20 (75 = 75%)'),
  ('SICK_MODE_THRESHOLD', 20, 'HP threshold for sick mode')
ON CONFLICT (key) DO NOTHING;

-- RLS for game_settings (read-only for everyone)
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game settings"
  ON public.game_settings FOR SELECT
  USING (true);

-- =============================================
-- 5. RESET DAILY COOK COUNT FUNCTION
-- =============================================

-- Call this when checking if user can earn rewards
CREATE OR REPLACE FUNCTION reset_daily_cook_if_needed(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_profile RECORD;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT daily_cook_count, last_cook_reset_date 
  INTO v_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Reset if last reset was before today
  IF v_profile.last_cook_reset_date < v_today THEN
    UPDATE public.profiles 
    SET daily_cook_count = 0, 
        last_cook_reset_date = v_today
    WHERE id = p_user_id;
    RETURN 0;
  END IF;
  
  RETURN v_profile.daily_cook_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. HEALTH DECAY FUNCTION (Daily Check)
-- =============================================

CREATE OR REPLACE FUNCTION check_and_apply_health_decay(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_last_cook TIMESTAMPTZ;
  v_days_since_cook INTEGER;
  v_health_change INTEGER := 0;
  v_new_health INTEGER;
  v_message TEXT := '';
  v_penalty_1day INTEGER;
  v_penalty_2plus INTEGER;
BEGIN
  -- Get profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN 
    RETURN jsonb_build_object('error', 'Profile not found');
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
  
  -- Calculate days since last cook (ignore partial days)
  v_days_since_cook := EXTRACT(DAY FROM (NOW() - v_last_cook))::INTEGER;
  
  -- Apply health penalties based on inactivity
  IF v_days_since_cook >= 2 THEN
    -- First day: -15 HP, subsequent days: -25 HP each
    v_health_change := -v_penalty_1day - (v_penalty_2plus * (v_days_since_cook - 1));
    v_message := format('Inactive %s days: %s HP', v_days_since_cook, v_health_change);
  ELSIF v_days_since_cook = 1 THEN
    v_health_change := -v_penalty_1day;
    v_message := format('Missed yesterday: %s HP', v_health_change);
  ELSE
    v_message := 'Active today, no penalty';
  END IF;
  
  -- Calculate new health (clamp to 5-100)
  v_new_health := GREATEST(5, LEAST(100, v_profile.health + v_health_change));
  
  -- Determine new mood based on health
  -- Update profile
  UPDATE public.profiles SET
    health = v_new_health,
    mood = CASE
      WHEN v_new_health >= 60 THEN 'happy'
      WHEN v_new_health >= 20 THEN 'neutral'
      ELSE 'sick'
    END,
    consecutive_inactive_days = v_days_since_cook,
    last_health_check_at = NOW()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'previous_health', v_profile.health,
    'new_health', v_new_health,
    'health_change', v_health_change,
    'inactive_days', v_days_since_cook,
    'mood', CASE 
      WHEN v_new_health >= 60 THEN 'happy'
      WHEN v_new_health >= 20 THEN 'neutral'
      ELSE 'sick'
    END,
    'message', v_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. COOK RECIPE AND GRANT REWARDS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION cook_recipe_and_grant_rewards(
  p_user_id UUID,
  p_recipe_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_recipe RECORD;
  v_profile RECORD;
  v_daily_limit INTEGER;
  v_current_count INTEGER;
  v_can_earn_rewards BOOLEAN;
  v_base_gold INTEGER;
  v_base_xp INTEGER;
  v_gold_earned INTEGER;
  v_xp_earned INTEGER;
  v_health_recovery INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_max_xp INTEGER;
  v_new_health INTEGER;
  v_sick_multiplier INTEGER;
  v_sick_threshold INTEGER;
BEGIN
  -- 1. Get recipe
  SELECT * INTO v_recipe FROM public.saved_recipes 
  WHERE id = p_recipe_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Recipe not found');
  END IF;
  
  IF v_recipe.is_cooked THEN
    RETURN jsonb_build_object('error', 'Recipe already cooked');
  END IF;
  
  -- 2. Get profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  
  -- 3. Get game settings
  SELECT value INTO v_daily_limit FROM public.game_settings WHERE key = 'DAILY_COOK_LIMIT';
  SELECT value INTO v_health_recovery FROM public.game_settings WHERE key = 'HEALTH_RECOVERY_COOK';
  SELECT value INTO v_sick_multiplier FROM public.game_settings WHERE key = 'SICK_MODE_XP_MULTIPLIER';
  SELECT value INTO v_sick_threshold FROM public.game_settings WHERE key = 'SICK_MODE_THRESHOLD';
  
  v_daily_limit := COALESCE(v_daily_limit, 5);
  v_health_recovery := COALESCE(v_health_recovery, 8);
  v_sick_multiplier := COALESCE(v_sick_multiplier, 75);
  v_sick_threshold := COALESCE(v_sick_threshold, 20);
  
  -- 4. Reset daily count if needed and check limit
  v_current_count := reset_daily_cook_if_needed(p_user_id);
  v_can_earn_rewards := v_current_count < v_daily_limit;
  
  -- 5. Calculate rewards based on recipe type
  v_base_gold := CASE v_recipe.recipe_type
    WHEN 'Hemat' THEN 50
    WHEN 'Balance' THEN 100
    WHEN 'Premium' THEN 200
    ELSE 100
  END;
  
  v_base_xp := CASE v_recipe.recipe_type
    WHEN 'Hemat' THEN 25
    WHEN 'Balance' THEN 35
    WHEN 'Premium' THEN 50
    ELSE 25
  END;
  
  -- Add savings bonus to gold
  v_gold_earned := v_base_gold + FLOOR(COALESCE(v_recipe.savings_vs_buying, 0) * 0.1);
  v_xp_earned := v_base_xp;
  
  -- Apply sick mode XP reduction (75% when HP <= 20)
  IF v_profile.health <= v_sick_threshold THEN
    v_xp_earned := FLOOR(v_xp_earned * v_sick_multiplier / 100);
  END IF;
  
  -- 6. If over daily limit, no rewards
  IF NOT v_can_earn_rewards THEN
    v_gold_earned := 0;
    v_xp_earned := 0;
  END IF;
  
  -- 7. Calculate new XP with level up (exponential formula)
  v_new_xp := v_profile.current_xp + v_xp_earned;
  v_new_level := v_profile.level;
  v_new_max_xp := v_profile.max_xp;
  
  -- Level up loop
  WHILE v_new_xp >= v_new_max_xp LOOP
    v_new_xp := v_new_xp - v_new_max_xp;
    v_new_level := v_new_level + 1;
    v_new_max_xp := calculate_max_xp(v_new_level);
  END LOOP;
  
  -- 8. Calculate new health (recovery from cooking)
  v_new_health := LEAST(100, v_profile.health + v_health_recovery);
  
  -- 9. Update recipe as cooked
  UPDATE public.saved_recipes SET
    is_cooked = TRUE,
    cooked_at = NOW(),
    gold_earned = v_gold_earned,
    xp_earned = v_xp_earned
  WHERE id = p_recipe_id;
  
  -- 10. Update profile
  UPDATE public.profiles SET
    wallet_balance = wallet_balance + v_gold_earned,
    current_xp = v_new_xp,
    level = v_new_level,
    max_xp = v_new_max_xp,
    health = v_new_health,
    mood = CASE
      WHEN v_new_health >= 60 THEN 'happy'
      WHEN v_new_health >= 20 THEN 'neutral'
      ELSE 'sick'
    END,
    daily_cook_count = CASE WHEN v_can_earn_rewards THEN daily_cook_count + 1 ELSE daily_cook_count END,
    consecutive_inactive_days = 0
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'gold_earned', v_gold_earned,
    'xp_earned', v_xp_earned,
    'new_balance', v_profile.wallet_balance + v_gold_earned,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'new_max_xp', v_new_max_xp,
    'new_health', v_new_health,
    'daily_cook_count', CASE WHEN v_can_earn_rewards THEN v_current_count + 1 ELSE v_current_count END,
    'hit_daily_limit', NOT v_can_earn_rewards,
    'leveled_up', v_new_level > v_profile.level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. SUBTRACT GOLD ON RECIPE DELETE FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION subtract_gold_on_recipe_delete(
  p_user_id UUID,
  p_recipe_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_recipe RECORD;
  v_profile RECORD;
  v_gold_to_subtract INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 1. Get recipe
  SELECT * INTO v_recipe FROM public.saved_recipes 
  WHERE id = p_recipe_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Recipe not found');
  END IF;
  
  -- 2. If not cooked, no gold to subtract
  IF NOT v_recipe.is_cooked THEN
    RETURN jsonb_build_object(
      'success', true,
      'gold_subtracted', 0,
      'message', 'Recipe was not cooked, no gold to subtract'
    );
  END IF;
  
  -- 3. Get current balance
  SELECT wallet_balance INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  -- 4. Calculate gold to subtract (Option B: subtract what they have)
  v_gold_to_subtract := v_recipe.gold_earned;
  v_new_balance := GREATEST(0, v_profile.wallet_balance - v_gold_to_subtract);
  
  -- 5. Update profile balance
  UPDATE public.profiles SET
    wallet_balance = v_new_balance
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'gold_subtracted', v_profile.wallet_balance - v_new_balance,
    'new_balance', v_new_balance,
    'message', format('Gold reduced by %s', v_profile.wallet_balance - v_new_balance)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. UPDATE EXISTING PROFILES MAX_XP TO EXPONENTIAL
-- =============================================

-- Recalculate max_xp for existing users based on their current level
-- This preserves their level but updates the XP requirement formula
UPDATE public.profiles
SET max_xp = calculate_max_xp(level)
WHERE max_xp = level * 100; -- Only update if using old linear formula

-- =============================================
-- 10. VERIFY MIGRATION
-- =============================================

-- Check new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'saved_recipes' 
  AND column_name IN ('is_cooked', 'cooked_at', 'gold_earned', 'xp_earned');

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('daily_cook_count', 'last_cook_reset_date', 'last_health_check_at', 'consecutive_inactive_days');

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'calculate_max_xp', 
    'reset_daily_cook_if_needed', 
    'check_and_apply_health_decay',
    'cook_recipe_and_grant_rewards',
    'subtract_gold_on_recipe_delete'
  );

-- =============================================
-- END OF MIGRATION
-- =============================================
