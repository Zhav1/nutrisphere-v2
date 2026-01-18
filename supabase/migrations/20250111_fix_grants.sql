
-- FIX MISSING GRANTS (PERMISSIONS)
-- "Permission denied" (42501) can happen even if RLS is off, if the role has no GRANTs.

-- 1. Grant usage on schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant ALL privileges on specific tables
-- This ensures 'authenticated' users can SELECT, INSERT, UPDATE, DELETE
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.food_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.saved_recipes TO anon, authenticated, service_role;

-- 3. Grant usage on ALL sequences (Critical for ID auto-generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Re-confirm RLS is disabled (Just to be absolutely safe)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes DISABLE ROW LEVEL SECURITY;

-- 5. If RLS *Must* be on, create a backup policy (Optional, commented out)
-- CREATE POLICY "Enable all access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
