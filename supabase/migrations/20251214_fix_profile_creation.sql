-- ============================================
-- NutriSphere Profile Auto-Recreation Fix
-- Migration: 20251214_fix_profile_creation.sql
-- ============================================
-- 
-- This migration:
-- 1. Updates handle_new_user() trigger to properly create profiles
-- 2. Adds INSERT policy for profiles table (if missing)
-- 
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. UPDATE HANDLE_NEW_USER TRIGGER
-- ============================================
-- The trigger should insert minimal required fields only.
-- All other fields use database defaults.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  -- Generate unique friend code
  LOOP
    new_code := generate_friend_code();
    BEGIN
      -- Insert profile with minimal fields - DB handles defaults for:
      -- level (1), current_xp (0), max_xp (100), health (100), mood ('neutral')
      -- wallet_balance (0), streak_days (0), is_fainted (false), etc.
      INSERT INTO public.profiles (
        id, 
        display_name, 
        avatar_url, 
        friend_code,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        COALESCE(
          NEW.raw_user_meta_data->>'display_name',
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        new_code,
        NOW(),
        NOW()
      );
      EXIT; -- Success
    EXCEPTION 
      WHEN unique_violation THEN
        -- Friend code collision, try again
        attempts := attempts + 1;
        IF attempts > 10 THEN
          -- Fallback: insert without friend_code
          INSERT INTO public.profiles (
            id, 
            display_name, 
            avatar_url,
            created_at,
            updated_at
          ) VALUES (
            NEW.id,
            COALESCE(
              NEW.raw_user_meta_data->>'display_name',
              NEW.raw_user_meta_data->>'full_name',
              split_part(NEW.email, '@', 1)
            ),
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW()
          );
          EXIT;
        END IF;
      WHEN OTHERS THEN
        -- Log error but don't fail authentication
        RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
        EXIT;
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. ENSURE INSERT POLICY EXISTS
-- ============================================
-- Allow authenticated users to insert their own profile
-- (This enables auto-create on login if profile was deleted)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Test the trigger function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- Check INSERT policy exists
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- ============================================
-- END OF MIGRATION
-- ============================================
