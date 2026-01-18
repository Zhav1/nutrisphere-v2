-- Add savings_vs_buying to cook_history table
-- This ensures we track the ACTUAL savings earned at cook time

ALTER TABLE recipe_cook_history 
ADD COLUMN IF NOT EXISTS savings_earned INTEGER DEFAULT 0;

-- Update existing records to use the recipe's current savings
-- (This is an approximation for old data)
UPDATE recipe_cook_history ch
SET savings_earned = (
  SELECT COALESCE(sr.savings_vs_buying, 0)
  FROM saved_recipes sr
  WHERE sr.id = ch.recipe_id
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_recipe_cook_history_savings 
ON recipe_cook_history(savings_earned);
