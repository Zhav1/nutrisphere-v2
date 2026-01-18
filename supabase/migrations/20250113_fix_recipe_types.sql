-- Fix recipe_type check constraint to match new standardized types
-- Previous types: Hemat, Comfort, Mewah
-- New types: Hemat, Balance, Premium

-- 1. Drop existing constraint
ALTER TABLE public.saved_recipes DROP CONSTRAINT IF EXISTS saved_recipes_recipe_type_check;

-- 2. Migrate existing data to new types (if any exists)
UPDATE public.saved_recipes SET recipe_type = 'Balance' WHERE recipe_type = 'Comfort';
UPDATE public.saved_recipes SET recipe_type = 'Premium' WHERE recipe_type = 'Mewah';

-- 3. Add new constraint
ALTER TABLE public.saved_recipes ADD CONSTRAINT saved_recipes_recipe_type_check 
  CHECK (recipe_type IN ('Hemat', 'Balance', 'Premium'));
