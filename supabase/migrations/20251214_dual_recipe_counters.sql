-- Dual Recipe Counters with Correct Table References
-- recipes_saved = COUNT of saved_recipes (saved recipe library)
-- recipes_cooked = COUNT of recipe_cook_history (cooking events)

-- ============================================
-- 1. ADD NEW COLUMN
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS recipes_saved INTEGER DEFAULT 0 CHECK (recipes_saved >= 0);

COMMENT ON COLUMN profiles.recipes_saved IS 'Count of saved recipes in user library';
COMMENT ON COLUMN profiles.recipes_cooked IS 'Count of cooking events (times recipes were cooked)';

-- ============================================
-- 2. CREATE TRIGGER FOR SAVED_RECIPES
-- ============================================
CREATE OR REPLACE FUNCTION update_recipes_saved_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment recipes_saved when recipe is saved
    UPDATE profiles 
    SET recipes_saved = recipes_saved + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement recipes_saved when recipe is deleted (never below 0)
    UPDATE profiles 
    SET recipes_saved = GREATEST(0, recipes_saved - 1)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_recipes_counter_trigger ON saved_recipes;

CREATE TRIGGER saved_recipes_counter_trigger
  AFTER INSERT OR DELETE ON saved_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_saved_counter();

-- ============================================
-- 3. CREATE TRIGGER FOR RECIPE_COOK_HISTORY
-- ============================================
CREATE OR REPLACE FUNCTION update_recipes_cooked_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment recipes_cooked when cooking event is recorded
    UPDATE profiles 
    SET recipes_cooked = recipes_cooked + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement recipes_cooked when cooking event is deleted
    UPDATE profiles 
    SET recipes_cooked = GREATEST(0, recipes_cooked - 1)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cook_history_counter_trigger ON recipe_cook_history;

CREATE TRIGGER cook_history_counter_trigger
  AFTER INSERT OR DELETE ON recipe_cook_history
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_cooked_counter();

-- ============================================
-- 4. BACKFILL EXISTING DATA
-- ============================================

-- Set recipes_saved = count of saved_recipes
UPDATE profiles p
SET recipes_saved = (
  SELECT COUNT(*) 
  FROM saved_recipes sr 
  WHERE sr.user_id = p.id
);

-- Set recipes_cooked = count of recipe_cook_history records
UPDATE profiles p
SET recipes_cooked = (
  SELECT COUNT(*)
  FROM recipe_cook_history rch
  WHERE rch.user_id = p.id
);

-- ============================================
-- 5. CREATE SYNC FUNCTION (For maintenance)
-- ============================================
CREATE OR REPLACE FUNCTION sync_recipe_counters()
RETURNS TABLE(
  user_id UUID, 
  old_saved INTEGER, 
  new_saved INTEGER, 
  old_cooked INTEGER, 
  new_cooked INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH counts AS (
    SELECT 
      p.id as profile_id,
      p.recipes_saved as old_s,
      COALESCE((SELECT COUNT(*) FROM saved_recipes sr WHERE sr.user_id = p.id), 0) as actual_s,
      p.recipes_cooked as old_c,
      COALESCE((SELECT COUNT(*) FROM recipe_cook_history rch WHERE rch.user_id = p.id), 0) as actual_c
    FROM profiles p
  )
  UPDATE profiles p
  SET 
    recipes_saved = c.actual_s,
    recipes_cooked = c.actual_c
  FROM counts c
  WHERE p.id = c.profile_id 
    AND (p.recipes_saved != c.actual_s OR p.recipes_cooked != c.actual_c)
  RETURNING p.id, c.old_s, p.recipes_saved, c.old_c, p.recipes_cooked;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM sync_recipe_counters();

-- ============================================
-- 6. DATA VERIFICATION
-- ============================================
-- Run this query to verify backfill worked correctly:
-- SELECT 
--   p.id,
--   p.display_name,
--   p.recipes_saved,
--   (SELECT COUNT(*) FROM saved_recipes WHERE user_id = p.id) as actual_saved,
--   p.recipes_cooked,
--   (SELECT COUNT(*) FROM recipe_cook_history WHERE user_id = p.id) as actual_cooked
-- FROM profiles p
-- WHERE p.recipes_saved > 0 OR p.recipes_cooked > 0;
