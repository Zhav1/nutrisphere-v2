-- Fix RLS permissions for recipe_cook_history table
-- Run this to grant proper access

-- Enable RLS (if not already enabled)
ALTER TABLE recipe_cook_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cook history" ON recipe_cook_history;
DROP POLICY IF EXISTS "Users can insert their own cook history" ON recipe_cook_history;
DROP POLICY IF EXISTS "Users can delete their own cook history" ON recipe_cook_history;

-- Create policies with both authenticated and anon roles
CREATE POLICY "Users can view their own cook history"
  ON recipe_cook_history FOR SELECT
  TO authenticated, anon
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cook history"
  ON recipe_cook_history FOR INSERT  
  TO authenticated, anon
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cook history"
  ON recipe_cook_history FOR DELETE
  TO authenticated, anon
  USING (auth.uid() = user_id);

-- Grant table permissions to anon role
GRANT SELECT, INSERT, DELETE ON recipe_cook_history TO anon;
GRANT SELECT, INSERT, DELETE ON recipe_cook_history TO authenticated;

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'recipe_cook_history';
