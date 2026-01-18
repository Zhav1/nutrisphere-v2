-- ============================================
-- FRIENDS FEATURE MIGRATION
-- ============================================
-- Creates friendships table and adds friend_code to profiles
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD FRIEND_CODE TO PROFILES
-- ============================================

-- Add friend_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS friend_code VARCHAR(12) UNIQUE;

-- Function to generate unique friend code
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed confusing chars (0,O,1,I)
  code TEXT := 'NS-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Generate friend codes for all existing profiles that don't have one
DO $$
DECLARE
  profile_record RECORD;
  new_code TEXT;
  attempts INTEGER;
BEGIN
  FOR profile_record IN 
    SELECT id FROM public.profiles WHERE friend_code IS NULL
  LOOP
    attempts := 0;
    LOOP
      new_code := generate_friend_code();
      BEGIN
        UPDATE public.profiles 
        SET friend_code = new_code 
        WHERE id = profile_record.id;
        EXIT; -- Success, exit inner loop
      EXCEPTION WHEN unique_violation THEN
        attempts := attempts + 1;
        IF attempts > 10 THEN
          RAISE EXCEPTION 'Could not generate unique friend code after 10 attempts';
        END IF;
      END;
    END LOOP;
  END LOOP;
END $$;

-- Update handle_new_user() to generate friend_code on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  LOOP
    new_code := generate_friend_code();
    BEGIN
      INSERT INTO public.profiles (id, display_name, avatar_url, friend_code)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'avatar_url',
        new_code
      );
      EXIT; -- Success
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts > 10 THEN
        -- Fallback: insert without friend_code, will be generated later
        INSERT INTO public.profiles (id, display_name, avatar_url)
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'display_name',
          NEW.raw_user_meta_data->>'avatar_url'
        );
        EXIT;
      END IF;
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. CREATE FRIENDSHIPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate friendship requests in same direction
  CONSTRAINT unique_friendship UNIQUE (sender_id, receiver_id),
  -- Prevent self-friending
  CONSTRAINT no_self_friendship CHECK (sender_id != receiver_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_friendships_sender ON public.friendships(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they are part of
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only send friend requests (as sender)
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update friendships where they are the receiver (accept/reject)
-- OR where they are sender (to cancel pending request)
CREATE POLICY "Users can update friendship status"
  ON public.friendships FOR UPDATE
  USING (
    (auth.uid() = receiver_id AND status = 'pending') OR
    (auth.uid() = sender_id AND status = 'pending')
  )
  WITH CHECK (
    (auth.uid() = receiver_id) OR
    (auth.uid() = sender_id AND status = 'pending')
  );

-- Users can delete friendships they are part of
CREATE POLICY "Users can delete friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============================================
-- 4. UPDATE PROFILES RLS FOR FRIEND SEARCH
-- ============================================

-- Allow users to search other profiles by friend_code or email
-- This policy allows SELECT on limited columns for search purposes
CREATE POLICY "Users can search other profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to view profiles

-- Note: We'll limit exposed fields at the API level, not RLS level
-- RLS here just allows the query, API will select specific columns

-- ============================================
-- 5. HELPER FUNCTION: Get mutual friendship status
-- ============================================

CREATE OR REPLACE FUNCTION get_friendship_status(user_a UUID, user_b UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT status INTO result
  FROM public.friendships
  WHERE 
    (sender_id = user_a AND receiver_id = user_b) OR
    (sender_id = user_b AND receiver_id = user_a)
  LIMIT 1;
  
  RETURN COALESCE(result, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify friend_code column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'friend_code';

-- Verify friendships table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'friendships';

-- Check existing friend codes were generated
SELECT id, display_name, friend_code 
FROM public.profiles 
LIMIT 5;
