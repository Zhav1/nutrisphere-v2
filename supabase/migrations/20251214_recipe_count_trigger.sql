-- Recipe Counter Trigger
-- Automatically maintains profiles.recipes_cooked counter
-- Eliminates need for COUNT queries and RLS complexity

-- ============================================
-- 1. CREATE TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_recipe_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment counter when recipe is created
    UPDATE profiles 
    SET recipes_cooked = recipes_cooked + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement counter when recipe is deleted (never below 0)
    UPDATE profiles 
    SET recipes_cooked = GREATEST(0, recipes_cooked - 1)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. CREATE TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS recipe_count_trigger ON recipes;

CREATE TRIGGER recipe_count_trigger
  AFTER INSERT OR DELETE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_count();

-- ============================================
-- 3. BACKFILL EXISTING DATA
-- ============================================
-- Sync all existing recipe counts to ensure accuracy
UPDATE profiles p
SET recipes_cooked = (
  SELECT COUNT(*) 
  FROM recipes r 
  WHERE r.user_id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM recipes r WHERE r.user_id = p.id
);

-- ============================================
-- 4. CREATE SYNC FUNCTION (For maintenance)
-- ============================================
CREATE OR REPLACE FUNCTION sync_recipe_counts()
RETURNS TABLE(user_id UUID, old_count INTEGER, new_count INTEGER, diff INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH counts AS (
    SELECT 
      p.id as profile_id,
      p.recipes_cooked as old,
      COALESCE((SELECT COUNT(*) FROM recipes r WHERE r.user_id = p.id), 0) as actual
    FROM profiles p
  )
  UPDATE profiles p
  SET recipes_cooked = c.actual
  FROM counts c
  WHERE p.id = c.profile_id AND p.recipes_cooked != c.actual
  RETURNING p.id, c.old, p.recipes_cooked, p.recipes_cooked - c.old;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM sync_recipe_counts();
