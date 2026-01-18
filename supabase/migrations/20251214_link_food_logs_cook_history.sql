-- Add foreign key to link food_logs with cook_history
-- This enables proper cascade deletion and reward reversal

ALTER TABLE food_logs 
ADD COLUMN cook_history_id UUID REFERENCES recipe_cook_history(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_food_logs_cook_history_id ON food_logs(cook_history_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE, UPDATE ON food_logs TO anon;
GRANT SELECT, INSERT, DELETE, UPDATE ON food_logs TO authenticated;
