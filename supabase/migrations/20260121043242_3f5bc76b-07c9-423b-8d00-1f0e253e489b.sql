-- Create INSERT policy for post-images storage bucket (allows authenticated users to upload)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');