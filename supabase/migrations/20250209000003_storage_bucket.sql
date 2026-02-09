-- Create the 'attachments' storage bucket for file uploads (images, audio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload own attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (bucket is public)
CREATE POLICY "Public read access for attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'attachments');
