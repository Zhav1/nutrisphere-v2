-- NutriSphere Database Schema
-- PostgreSQL + Row Level Security (RLS)
-- Run this in Supabase SQL Editor or via migration

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Gamification: NutriGotchi
  wallet_balance INTEGER DEFAULT 0 CHECK (wallet_balance >= 0),
  total_savings_rp INTEGER DEFAULT 0 CHECK (total_savings_rp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
  max_xp INTEGER DEFAULT 100 CHECK (max_xp >= 100),
  health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  mood TEXT DEFAULT 'neutral' CHECK (mood IN ('happy', 'neutral', 'sick')),
  accessories JSONB DEFAULT '[]'::jsonb,
  
  -- Stats
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  recipes_cooked INTEGER DEFAULT 0 CHECK (recipes_cooked >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. FOOD LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Food details
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
  protein NUMERIC(6,2) DEFAULT 0 CHECK (protein >= 0),
  carbs NUMERIC(6,2) DEFAULT 0 CHECK (carbs >= 0),
  fat NUMERIC(6,2) DEFAULT 0 CHECK (fat >= 0),
  sugar NUMERIC(6,2) DEFAULT 0 CHECK (sugar >= 0),
  sodium NUMERIC(6,2) DEFAULT 0 CHECK (sodium >= 0),
  
  -- Metadata
  health_grade TEXT CHECK (health_grade IN ('A', 'B', 'C', 'D')),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  source TEXT CHECK (source IN ('ocr_scan', 'object_detection', 'manual', 'recipe')),
  
  -- Optional: Image evidence
  image_url TEXT,
  
  -- OCR data (if from scan)
  ocr_raw_text TEXT,
  ocr_sanitized_data JSONB,
  
  -- Timestamps
  consumed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_logs_user_id ON public.food_logs(user_id);
CREATE INDEX idx_food_logs_consumed_at ON public.food_logs(consumed_at DESC);

-- RLS Policies for food_logs
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs"
  ON public.food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON public.food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON public.food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON public.food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. RECIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Recipe details
  title TEXT NOT NULL,
  total_cost_rp INTEGER NOT NULL CHECK (total_cost_rp >= 0),
  savings_vs_buying_rp INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0 CHECK (calories >= 0),
  protein NUMERIC(6,2) DEFAULT 0 CHECK (protein >= 0),
  
  -- Recipe data (stored as JSONB for flexibility)
  ingredients JSONB NOT NULL,
  steps JSONB NOT NULL,
  
  -- Metadata
  is_rice_cooker_only BOOLEAN DEFAULT false,
  tools_required TEXT[],
  
  -- User engagement
  is_favorite BOOLEAN DEFAULT false,
  times_cooked INTEGER DEFAULT 0 CHECK (times_cooked >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_cooked_at TIMESTAMPTZ
);

CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX idx_recipes_favorite ON public.recipes(is_favorite) WHERE is_favorite = true;

-- RLS Policies for recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CROWD CONTRIBUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.crowd_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Product identification
  barcode TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  
  -- Nutrition data (validated)
  nutrition_data JSONB NOT NULL,
  health_grade TEXT CHECK (health_grade IN ('A', 'B', 'C', 'D')),
  
  -- Evidence
  image_url TEXT,
  
  -- Community validation
  upvotes INTEGER DEFAULT 0 CHECK (upvotes >= 0),
  downvotes INTEGER DEFAULT 0 CHECK (downvotes >= 0),
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crowd_contributions_barcode ON public.crowd_contributions(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_crowd_contributions_verified ON public.crowd_contributions(is_verified);
CREATE INDEX idx_crowd_contributions_product_name ON public.crowd_contributions(product_name);

-- RLS Policies for crowd_contributions
ALTER TABLE public.crowd_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified contributions"
  ON public.crowd_contributions FOR SELECT
  USING (is_verified = true OR auth.uid() = contributor_id);

CREATE POLICY "Authenticated users can insert contributions"
  ON public.crowd_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Contributors can update own contributions"
  ON public.crowd_contributions FOR UPDATE
  USING (auth.uid() = contributor_id);

-- ============================================
-- 5. ACCESSORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('hat', 'outfit', 'background', 'pet')),
  price_gold INTEGER NOT NULL CHECK (price_gold >= 0),
  image_url TEXT,
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  required_level INTEGER DEFAULT 1 CHECK (required_level >= 1),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accessories_available ON public.accessories(is_available) WHERE is_available = true;
CREATE INDEX idx_accessories_category ON public.accessories(category);

-- RLS Policies for accessories
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available accessories"
  ON public.accessories FOR SELECT
  USING (is_available = true);

-- Admin-only insert/update (handled via service role key)
CREATE POLICY "Service role can manage accessories"
  ON public.accessories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update NutriGotchi health based on recent nutrition
CREATE OR REPLACE FUNCTION public.calculate_nutrigotchi_health(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_health_grade NUMERIC;
  new_health INTEGER;
BEGIN
  -- Calculate average health grade from last 3 days
  SELECT AVG(
    CASE health_grade
      WHEN 'A' THEN 100
      WHEN 'B' THEN 75
      WHEN 'C' THEN 50
      WHEN 'D' THEN 25
      ELSE 50
    END
  ) INTO avg_health_grade
  FROM public.food_logs
  WHERE user_id = p_user_id
    AND consumed_at >= NOW() - INTERVAL '3 days'
    AND health_grade IS NOT NULL;
  
  -- Default to 100 if no recent logs
  new_health := COALESCE(ROUND(avg_health_grade), 100);
  
  -- Clamp between 0 and 100
  new_health := GREATEST(0, LEAST(100, new_health));
  
  -- Update profile
  UPDATE public.profiles
  SET health = new_health,
      mood = CASE
        WHEN new_health >= 75 THEN 'happy'
        WHEN new_health >= 40 THEN 'neutral'
        ELSE 'sick'
      END
  WHERE id = p_user_id;
  
  RETURN new_health;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. STORAGE BUCKETS (Run via Supabase Dashboard or API)
-- ============================================

-- Note: These commands are for reference. Execute via Supabase Dashboard > Storage

-- Create buckets:
-- 1. food-images (for OCR scans and meal photos)
--    - Public: true
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--    - Max file size: 5MB

-- 2. avatars (for user profile pictures)
--    - Public: true
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--    - Max file size: 2MB

-- 3. product-labels (for crowd contribution evidence)
--    - Public: false
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--    - Max file size: 5MB

-- Storage policies (example for food-images):
-- CREATE POLICY "Authenticated users can upload food images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'food-images');

-- CREATE POLICY "Users can update own food images"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'food-images' AND owner = auth.uid());

-- ============================================
-- 8. SAMPLE DATA (Optional)
-- ============================================

-- Insert sample accessories
INSERT INTO public.accessories (name, description, category, price_gold, is_available, required_level)
VALUES
  ('Chef Hat', 'Classic white chef hat for your NutriGotchi', 'hat', 50, true, 1),
  ('Sports Band', 'Motivational headband for active NutriGotchis', 'hat', 75, true, 2),
  ('Apron', 'Cute cooking apron', 'outfit', 100, true, 1),
  ('Running Shoes', 'For health-conscious NutriGotchis', 'outfit', 150, true, 3),
  ('Kitchen Background', 'Cozy kitchen scene', 'background', 200, true, 5),
  ('Garden Background', 'Fresh vegetable garden', 'background', 250, true, 7),
  ('Tiny Spatula', 'Adorable cooking companion', 'pet', 300, true, 10)
ON CONFLICT DO NOTHING;

-- ============================================
-- END OF MIGRATION
-- ============================================

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'food_logs', 'recipes', 'crowd_contributions', 'accessories');
