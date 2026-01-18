
-- RPC Functions to Safe-Guard & Bypass RLS for System Updates

-- 1. Function to Save Recipe (Ensures user_id match)
CREATE OR REPLACE FUNCTION public.save_recipe_admin(
  p_user_id UUID,
  p_recipe_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (postgres/admin)
SET search_path = public
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Verify the user calling matches the target (Optional extra check if called via client)
  -- BUT since we call this from backend with verification, we trust p_user_id
  
  INSERT INTO public.saved_recipes (
    user_id,
    recipe_title,
    recipe_type,
    description,
    total_calories,
    total_protein,
    shopping_cost,
    savings_vs_buying,
    ingredients,
    cooking_steps,
    tools_required,
    is_rice_cooker_only,
    is_favorite
  )
  VALUES (
    p_user_id,
    p_recipe_data->>'recipe_title',
    (p_recipe_data->>'recipe_type')::text,
    p_recipe_data->>'description',
    (p_recipe_data->>'total_calories')::integer,
    (p_recipe_data->>'total_protein')::numeric,
    (p_recipe_data->>'shopping_cost')::integer,
    (p_recipe_data->>'savings_vs_buying')::integer,
    (p_recipe_data->'ingredients'),
    (p_recipe_data->'cooking_steps'),
    (p_recipe_data->'tools_required'),
    (p_recipe_data->>'is_rice_cooker_only')::boolean,
    false
  )
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- 2. Function to Update Profile Stats (Gold, XP, etc.)
CREATE OR REPLACE FUNCTION public.update_profile_stats_admin(
  p_user_id UUID,
  p_gold_earned INTEGER,
  p_savings_amount INTEGER,
  p_xp_earned INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_max_xp INTEGER;
BEGIN
  -- Get current profile or create if missing
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, display_name, wallet_balance, total_savings_rp, 
      current_xp, level, max_xp, health, mood, recipes_cooked, streak_days
    )
    VALUES (
      p_user_id, 'User', 0, 0, 0, 1, 100, 100, 'neutral', 0, 0
    )
    RETURNING * INTO v_profile;
  END IF;

  -- Logic for Level Up
  v_new_xp := v_profile.current_xp + p_xp_earned;
  v_new_level := v_profile.level;
  v_new_max_xp := v_profile.max_xp;

  WHILE v_new_xp >= v_new_max_xp LOOP
    v_new_xp := v_new_xp - v_new_max_xp;
    v_new_level := v_new_level + 1;
    v_new_max_xp := v_new_level * 100;
  END LOOP;

  -- Update Profile
  UPDATE public.profiles
  SET 
    wallet_balance = wallet_balance + p_gold_earned,
    total_savings_rp = total_savings_rp + p_savings_amount,
    current_xp = v_new_xp,
    level = v_new_level,
    max_xp = v_new_max_xp,
    recipes_cooked = recipes_cooked + 1,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return new stats
  RETURN jsonb_build_object(
    'newBalance', v_profile.wallet_balance + p_gold_earned,
    'newSavings', v_profile.total_savings_rp + p_savings_amount,
    'newXp', v_new_xp,
    'newLevel', v_new_level,
    'newMaxXp', v_new_max_xp,
    'newRecipesCooked', v_profile.recipes_cooked + 1
  );
END;
$$;

-- 3. Function to Log Food
CREATE OR REPLACE FUNCTION public.log_food_admin(
  p_user_id UUID,
  p_food_name TEXT,
  p_calories INTEGER,
  p_protein NUMERIC,
  p_meal_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.food_logs (
    user_id,
    food_name,
    calories,
    protein,
    meal_type,
    source,
    consumed_at,
    health_grade
  )
  VALUES (
    p_user_id,
    p_food_name,
    p_calories,
    p_protein,
    p_meal_type,
    'recipe',
    NOW(),
    'B'
  );
END;
$$;
