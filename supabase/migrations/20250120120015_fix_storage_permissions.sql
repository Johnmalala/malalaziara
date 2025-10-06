/*
# [Fix] Correct Storage Permissions for Image Uploads

This script resets and applies the correct security policies for the `listing_images` storage bucket.
It ensures that authenticated users with the 'admin' role have full permission to upload, view, update, and delete images, and that the public has permission to view them. This is required for the admin dashboard's image uploader to function correctly.

## Query Description:
This operation first drops any existing policies to prevent conflicts and then creates new, correct ones. It is a safe operation that only affects access permissions and does not risk any stored data.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the policies)
*/

-- Drop existing policies if they exist to ensure a clean slate.
DROP POLICY IF EXISTS "Admin full access to listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for listing images" ON storage.objects;

-- Create the policy that allows ADMINS to perform all actions on the listing_images bucket.
CREATE POLICY "Admin full access to listing images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'listing_images' AND
  (select role from public.profiles where id = auth.uid()) = 'admin'
)
WITH CHECK (
  bucket_id = 'listing_images' AND
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Create the policy that allows the PUBLIC to view images.
-- This is crucial for the images to be displayed in the app after upload.
CREATE POLICY "Public read access for listing images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'listing_images' );
