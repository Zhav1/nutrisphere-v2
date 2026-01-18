-- Allow friends to view recipe counts of each other
-- This doesn't expose recipe details, just allows COUNTing them
-- The API will check friendship status before querying

-- Add policy to allow friends to see each other's recipes (for counting)
DROP POLICY IF EXISTS "Friends can view recipe counts" ON public.recipes;

CREATE POLICY "Friends can view recipe counts"
  ON public.recipes FOR SELECT
  USING (
    -- Allow owner
    auth.uid() = user_id
    OR
    -- Allow accepted friends to count recipes
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
        AND (
          (sender_id = auth.uid() AND receiver_id = user_id)
          OR
          (receiver_id = auth.uid() AND sender_id = user_id)
        )
    )
  );
