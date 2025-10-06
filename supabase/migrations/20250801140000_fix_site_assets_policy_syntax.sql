/*
# [Fix] Correct Storage Policies for site_assets

This migration corrects a syntax error from a previous script and properly configures Row Level Security (RLS) policies for the `site_assets` storage bucket.

## Query Description:
This script performs the following actions:
1.  **Drops Previous Policies:** It safely removes any potentially broken or incorrect policies on the `storage.objects` table related to the `site_assets` bucket to ensure a clean state.
2.  **Creates Public Read Access:** It adds a policy to allow anyone to view images within the `site_assets` bucket. This is necessary for the banner image to be visible on your public website.
3.  **Creates Authenticated Write Access:** It adds separate, syntactically correct policies to allow any authenticated user (i.e., a logged-in admin) to upload, update, and delete objects within the `site_assets` bucket. This is required for the image uploader in the admin panel to function.

This operation is safe and will not affect any existing data. It only modifies security policies.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Affects RLS policies on the `storage.objects` table.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Policies are created for both public (read-only) and authenticated (write) roles.
*/

-- Drop any potentially incorrect policies from the previous attempt to ensure a clean slate.
DROP POLICY IF EXISTS "Allow authenticated uploads on site_assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates on site_assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes on site_assets" ON storage.objects;

-- 1. Public Read Access
-- Allow anyone to view images in the 'site_assets' bucket. This is required for the banner to be public.
CREATE POLICY "Allow public read access on site_assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site_assets' );

-- 2. Authenticated Insert
-- Allow authenticated users (admins) to upload new images.
CREATE POLICY "Allow authenticated inserts on site_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'site_assets' );

-- 3. Authenticated Update
-- Allow authenticated users (admins) to update/replace existing images.
CREATE POLICY "Allow authenticated updates on site_assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'site_assets' );

-- 4. Authenticated Delete
-- Allow authenticated users (admins) to delete images.
CREATE POLICY "Allow authenticated deletes on site_assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'site_assets' );
