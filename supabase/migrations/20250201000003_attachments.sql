-- Add attachments column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
