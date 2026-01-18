-- FIX PERMISSIONS FOR FRIENDS FEATURE
-- Run this in Supabase SQL Editor to resolve "permission denied" error (42501)

-- 1. Grant explicit permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.friendships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.friendships TO service_role;

-- 2. Ensure RLS is enabled (just to be safe)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 3. Verify Grants (Output should show permissions)
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'friendships';
