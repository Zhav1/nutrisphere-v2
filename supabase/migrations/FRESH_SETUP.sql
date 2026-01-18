-- ============================================
-- NutriSphere FRESH SETUP - Complete Reset
-- ============================================
-- Run this if you deleted everything and need a fresh start
-- This creates the profiles table, trigger, and all necessary functions
-- ============================================

-- ============================================
-- 1. DROP EXISTING TRIGGER (if exists)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- 2. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Gamification: NutriGotchi
  wallet_balance INTEGER DEFAULT 0 CHECK (wallet_balance >= 0),
  total_savings_rp INTEGER DEFAULT 0 CHECK (total_savings_rp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
  max_xp INTEGER DEFAULT 100 CHECK (max_xp > 0),
  health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  mood TEXT DEFAULT 'happy' CHECK (mood IN ('happy', 'neutral', 'sick')),
  
  -- Streak & Activity
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  recipes_cooked INTEGER DEFAULT 0 CHECK (recipes_cooked >= 0),
  daily_cook_count INTEGER DEFAULT 0,
  last_cook_reset_date DATE DEFAULT CURRENT_DATE,
  last_cook_date DATE,
  last_health_check_at TIMESTAMPTZ DEFAULT NOW(),
  consecutive_inactive_days INTEGER DEFAULT 0,
  
  -- Faint system
  is_fainted BOOLEAN DEFAULT FALSE,
  faint_recovery_count INTEGER DEFAULT 0,
  streak_shield_active BOOLEAN DEFAULT FALSE,
  
  -- Equipment
  equipped_accessories JSONB DEFAULT '[]'::jsonb,
  
  -- Friends
  friend_code VARCHAR(12) UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CREATE FRIEND CODE GENERATOR FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := 'NS-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE HANDLE_NEW_USER TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  -- Generate unique friend code with retry
  LOOP
    new_code := generate_friend_code();
    BEGIN
      INSERT INTO public.profiles (
        id, 
        display_name, 
        avatar_url, 
        friend_code
      ) VALUES (
        NEW.id,
        COALESCE(
          NEW.raw_user_meta_data->>'display_name',
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        new_code
      );
      EXIT; -- Success
    EXCEPTION 
      WHEN unique_violation THEN
        attempts := attempts + 1;
        IF attempts > 10 THEN
          -- Fallback: insert without friend_code
          INSERT INTO public.profiles (id, display_name, avatar_url)
          VALUES (
            NEW.id,
            COALESCE(
              NEW.raw_user_meta_data->>'display_name',
              split_part(NEW.email, '@', 1)
            ),
            NEW.raw_user_meta_data->>'avatar_url'
          );
          EXIT;
        END IF;
      WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user failed: %', SQLERRM;
        EXIT;
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. CREATE TRIGGER ON AUTH.USERS
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. RLS POLICIES FOR PROFILES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can search other profiles" ON public.profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow searching other profiles (for friend search)
CREATE POLICY "Users can search other profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 7. VERIFICATION
-- ============================================
SELECT 'profiles table exists' AS check, EXISTS(
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'profiles'
) AS result;

SELECT 'handle_new_user function exists' AS check, EXISTS(
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'handle_new_user'
) AS result;

SELECT 'trigger exists' AS check, EXISTS(
  SELECT 1 FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created'
) AS result;

-- ============================================
-- DONE! Try registering a new user now.
-- ============================================
