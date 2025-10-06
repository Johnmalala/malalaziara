/*
# [Fix] Storage Policies for Image Uploads
This migration ensures the correct security policies are in place for the `listing_images` storage bucket. It allows authenticated users (like admins) to upload images, and allows anyone to view them. This will fix issues where image uploads were failing silently due to permission errors.

## Query Description:
- This operation is safe and non-destructive.
- It drops any previous, potentially incorrect policies and recreates them correctly.
- There is no risk to existing data.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by altering the policies)
*/

-- Drop existing policies to ensure a clean slate, ignoring errors if they don't exist.
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Recreate policies with correct permissions

-- Policy to allow authenticated users (e.g., admins) to upload to the listing_images bucket.
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'listing_images' );

-- Policy to allow anyone to view images in the listing_images bucket.
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listing_images' );

-- Policy to allow the user who uploaded the image to update it.
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'listing_images' );

-- Policy to allow the user who uploaded the image to delete it.
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
