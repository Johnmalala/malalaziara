/*
# [Security] Grant Permissions for Site Assets Bucket
This migration sets up the necessary Row Level Security (RLS) policies for the `site_assets` storage bucket. It allows authenticated users (administrators) to upload, update, and delete assets like the site banner.

## Query Description:
- This script creates two policies on the `storage.objects` table, specifically for the `site_assets` bucket.
- The first policy allows any authenticated user to upload files to this bucket.
- The second policy allows an authenticated user to update or delete files that they own within this bucket.
- This is a safe, non-destructive operation.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `storage.objects`
- Policies: `Allow authenticated uploads for site_assets`, `Allow authenticated owner actions for site_assets`

## Security Implications:
- RLS Status: Enabled on `storage.objects` by default.
- Policy Changes: Yes, adding two new policies.
- Auth Requirements: Policies target the `authenticated` role.
*/

-- 1. Allow authenticated users to upload to the 'site_assets' bucket
CREATE POLICY "Allow authenticated uploads for site_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'site_assets' );

-- 2. Allow authenticated users to update/delete their own files in 'site_assets'
CREATE POLICY "Allow authenticated owner actions for site_assets"
ON storage.objects FOR UPDATE, DELETE
TO authenticated
USING ( bucket_id = 'site_assets' AND auth.uid() = owner );
