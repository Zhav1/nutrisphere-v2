-- Migration: Add macronutrient columns to saved_recipes
-- Run this in your Supabase SQL Editor

-- Add fat and carbs columns with default values
ALTER TABLE saved_recipes 
ADD COLUMN IF NOT EXISTS total_fat INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_carbs INTEGER DEFAULT 0;

-- Add a comment for documentation
COMMENT ON COLUMN saved_recipes.total_fat IS 'Total fat in grams for the recipe';
COMMENT ON COLUMN saved_recipes.total_carbs IS 'Total carbohydrates in grams for the recipe';

-- Update food_logs table to include fat if not exists
ALTER TABLE food_logs
ADD COLUMN IF NOT EXISTS fat INTEGER DEFAULT 0;

COMMENT ON COLUMN food_logs.fat IS 'Fat in grams for the food item';
