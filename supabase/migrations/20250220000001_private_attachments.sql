-- Make attachments bucket private (was public)
UPDATE storage.buckets
SET public = false
WHERE id = 'attachments';

-- Drop the public read policy
DROP POLICY IF EXISTS "attachments_select" ON storage.objects;

-- Add owner-scoped read policy (users can only read their own files)
CREATE POLICY "attachments_select_owner"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
