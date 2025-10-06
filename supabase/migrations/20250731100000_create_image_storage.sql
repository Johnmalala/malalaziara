/*
# [Create Image Storage Bucket and Policies]
This migration creates the necessary storage bucket for listing images and sets up the required security policies for access. This will resolve the "Bucket not found" error during image uploads.

## Query Description: [This operation creates a new storage bucket named 'listing_images' and configures its access policies. It is a structural change and is safe to run. It does not affect existing data in the database, but it enables new functionality (image uploads).]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Creates storage bucket: `listing_images`
- Creates RLS policies on `storage.objects` for the `listing_images` bucket.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Users must be authenticated to upload, update, or delete images. Images are publicly readable.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: [Low. This enables storage functionality with minimal performance overhead.]
*/

-- 1. Create the storage bucket for listing images if it doesn't exist.
-- This bucket will store all images related to tours, stays, and volunteer opportunities.
-- It is marked as public to allow for easy access to image URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing_images', 'listing_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS for the storage objects table
-- This is often enabled by default, but we ensure it here.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the `listing_images` bucket.
-- We drop existing policies to ensure a clean, idempotent setup.

-- Public Read Access
DROP POLICY IF EXISTS "Allow public read access on listing_images" ON storage.objects;
CREATE POLICY "Allow public read access on listing_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing_images');

-- Authenticated Upload
DROP POLICY IF EXISTS "Allow authenticated users to upload to listing_images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload to listing_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing_images' AND auth.role() = 'authenticated');

-- Owner Update
DROP POLICY IF EXISTS "Allow owner to update on listing_images" ON storage.objects;
CREATE POLICY "Allow owner to update on listing_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing_images' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'listing_images' AND auth.uid() = owner);

-- Owner Delete
DROP POLICY IF EXISTS "Allow owner to delete on listing_images" ON storage.objects;
CREATE POLICY "Allow owner to delete on listing_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing_images' AND auth.uid() = owner);
