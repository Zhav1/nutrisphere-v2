-- Add deleted_at column for soft deletes
ALTER TABLE friendships 
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX idx_friendships_deleted_at ON friendships(deleted_at);

-- Update the view/queries to exclude deleted friendships
-- (This will be handled in application code)
