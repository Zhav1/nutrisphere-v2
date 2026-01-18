
-- Force RLS Policy Update for Profiles and Food Logs

-- 1. Profiles: Drop existing policies to be safe
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. Profiles: Re-create robust policies
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

-- 3. Food Logs: Drop existing policies
DROP POLICY IF EXISTS "Users can view own food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Users can insert own food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Users can update own food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Users can delete own food logs" ON public.food_logs;

-- 4. Food Logs: Re-create robust policies
CREATE POLICY "Users can view own food logs"
  ON public.food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON public.food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON public.food_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON public.food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Saved Recipes: Drop existing policies
DROP POLICY IF EXISTS "Users can view own recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON public.saved_recipes;

-- 6. Saved Recipes: Re-create policies
CREATE POLICY "Users can view own recipes"
  ON public.saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON public.saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.saved_recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Verify
SELECT * FROM public.profiles LIMIT 1;
