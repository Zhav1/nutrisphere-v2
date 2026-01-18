-- Migration: Vision Architecture Update
-- Removes legacy OCR fields and updates to Vision-based schema

-- Remove ocr_raw_text column (no longer needed with Gemini Vision)
ALTER TABLE public.food_logs DROP COLUMN IF EXISTS ocr_raw_text;

-- Rename ocr_sanitized_data to nutrition_data
ALTER TABLE public.food_logs 
  RENAME COLUMN ocr_sanitized_data TO nutrition_data;

-- Update source enum constraint to replace 'ocr_scan' with 'vision_scan'
ALTER TABLE public.food_logs 
  DROP CONSTRAINT IF EXISTS food_logs_source_check;

ALTER TABLE public.food_logs 
  ADD CONSTRAINT food_logs_source_check 
  CHECK (source IN ('vision_scan', 'object_detection', 'manual', 'recipe'));

-- Add comment explaining migration
COMMENT ON COLUMN public.food_logs.nutrition_data IS 'Structured nutritional data extracted from Gemini Vision analysis';
COMMENT ON COLUMN public.food_logs.source IS 'Data source: vision_scan (Gemini multimodal), object_detection (TF.js), manual (user input), or recipe (generated)';
