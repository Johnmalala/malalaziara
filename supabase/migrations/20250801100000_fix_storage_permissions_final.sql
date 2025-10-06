/*
# [Fix] Storage Bucket and RLS Policies for listing_images

This migration corrects the setup for the `listing_images` storage bucket. It ensures the bucket exists and that Row Level Security (RLS) policies are correctly configured to allow administrators to manage images.

## Query Description: 
This script is safe to run. It creates the `listing_images` bucket if it's missing and replaces any existing, potentially incorrect policies for this bucket with the correct ones. It does NOT delete any data. The main cause of the previous `42501` error was an attempt to alter the `storage.objects` table, which is protected. This script avoids that by only creating policies, which is the correct procedure.

## Metadata:
- Schema-Category: ["Structural", "Security"]
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Creates storage bucket: `listing_images` (if not exists).
- Creates/Replaces RLS policies on `storage.objects` for `listing_images` bucket.
- Creates/Replaces helper function `is_admin()`.

## Security Implications:
- RLS Status: Policies are created/replaced on `storage.objects`.
- Policy Changes: Yes.
  - Public SELECT access is granted for the `listing_images` bucket.
  - INSERT, UPDATE, DELETE operations are restricted to users with the 'admin' role.
- Auth Requirements: JWT from an authenticated user is required for upload/delete.

## Performance Impact:
- Indexes: None.
- Triggers: None- Estimated Impact: Negligible. The helper function and RLS policies are highly optimized.
*/

-- 1. Create the storage bucket if it doesn't exist.
-- The bucket is made public to allow for public URLs, as used in the application.
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing_images', 'listing_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create a helper function to check for admin role.
-- This is secure because it's a SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Fallback to 'user' if the profile doesn't exist or role is null
  SELECT COALESCE(role, 'user') INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop existing policies to ensure a clean slate and avoid conflicts.
DROP POLICY IF EXISTS "Allow public select on listing_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin inserts on listing_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates on listing_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes on listing_images" ON storage.objects;

-- 4. Create new RLS policies for the 'listing_images' bucket.

-- Since the bucket is public, SELECT is implicitly allowed for anyone with the URL.
-- This policy is for API-based access (e.g., listing files).
CREATE POLICY "Allow public select on listing_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing_images');

-- Allow admin users to upload images.
CREATE POLICY "Allow admin inserts on listing_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing_images' AND is_admin());

-- Allow admin users to update image metadata.
CREATE POLICY "Allow admin updates on listing_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing_images' AND is_admin());

-- Allow admin users to delete images.
CREATE POLICY "Allow admin deletes on listing_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing_images' AND is_admin());

-- IMPORTANT: This script intentionally does NOT include 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY'.
-- It is already enabled by Supabase, and attempting to re-enable it causes the '42501' permission error.
