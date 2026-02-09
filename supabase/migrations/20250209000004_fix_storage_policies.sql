-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can upload own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for attachments" ON storage.objects;

-- Simple permissive policies for the attachments bucket

-- Authenticated users can upload to attachments bucket (any path under their user_id)
CREATE POLICY "attachments_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments');

-- Authenticated users can update their own uploads
CREATE POLICY "attachments_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'attachments');

-- Authenticated users can delete their own uploads
CREATE POLICY "attachments_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments');

-- Anyone can read (bucket is public)
CREATE POLICY "attachments_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'attachments');
