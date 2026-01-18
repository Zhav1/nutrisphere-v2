
-- NUCLEAR OPTION: DISABLE RLS
-- Use this to confirm if RLS is the blocker.
-- WARNING: This makes all data public to any authenticated (or anon) user with the client key.

-- 1. Profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Food Logs
ALTER TABLE public.food_logs DISABLE ROW LEVEL SECURITY;

-- 3. Saved Recipes
ALTER TABLE public.saved_recipes DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT * FROM public.profiles LIMIT 1;
