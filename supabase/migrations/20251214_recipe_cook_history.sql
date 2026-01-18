-- Migration: Enable Recipe Re-cooking with Full History Tracking
-- Created: 2025-12-14
-- Purpose: Allow users to cook the same recipe multiple times and track cooking history

-- 1. Create recipe_cook_history table for full cooking timeline
CREATE TABLE IF NOT EXISTS recipe_cook_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES saved_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cooked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gold_earned INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  hit_daily_limit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add indexes for performance
CREATE INDEX idx_recipe_cook_history_recipe_id ON recipe_cook_history(recipe_id);
CREATE INDEX idx_recipe_cook_history_user_id ON recipe_cook_history(user_id);
CREATE INDEX idx_recipe_cook_history_cooked_at ON recipe_cook_history(cooked_at DESC);

-- 3. Add new columns to saved_recipes
ALTER TABLE saved_recipes 
ADD COLUMN IF NOT EXISTS first_cooked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_cooked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS times_cooked INTEGER DEFAULT 0;

-- 4. Migrate existing is_cooked data
-- For recipes that are already cooked, set first and last cooked to the cooked_at timestamp
UPDATE saved_recipes 
SET 
  first_cooked_at = cooked_at,
  last_cooked_at = cooked_at,
  times_cooked = 1
WHERE is_cooked = true AND cooked_at IS NOT NULL;

-- 5. Insert existing cooked recipes into cook history
INSERT INTO recipe_cook_history (recipe_id, user_id, cooked_at, gold_earned, xp_earned)
SELECT 
  id as recipe_id,
  user_id,
  cooked_at,
  COALESCE(gold_earned, 0) as gold_earned,
  COALESCE(xp_earned, 0) as xp_earned
FROM saved_recipes
WHERE is_cooked = true AND cooked_at IS NOT NULL;

-- 6. Create RLS policies for recipe_cook_history
ALTER TABLE recipe_cook_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cook history"
  ON recipe_cook_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cook history"
  ON recipe_cook_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cook history"
  ON recipe_cook_history FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create helper function to get cook count
CREATE OR REPLACE FUNCTION get_recipe_cook_count(recipe_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM recipe_cook_history
    WHERE recipe_id = recipe_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add comment for documentation
COMMENT ON TABLE recipe_cook_history IS 'Full timeline of when recipes were cooked, with rewards earned';
COMMENT ON COLUMN saved_recipes.first_cooked_at IS 'Timestamp when recipe was first cooked';
COMMENT ON COLUMN saved_recipes.last_cooked_at IS 'Timestamp when recipe was most recently cooked';
COMMENT ON COLUMN saved_recipes.times_cooked IS 'Total number of times this recipe has been cooked';

-- NOTE: We keep is_cooked and cooked_at columns for now to avoid breaking existing code
-- They will be deprecated and removed in a future migration after all code is updated
-- For now, we'll update both old and new columns to maintain backward compatibility
