/*
          # [Structural] Create Storage Bucket and Availability Table
          [This migration creates a new storage bucket for listing images and a table to track unavailable dates for listings. It also sets up the necessary security policies.]

          ## Query Description: [This operation adds new database objects. It is safe to run and does not affect existing data, but it is required for the new image upload and calendar features to function.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Creates Storage Bucket: `listing_images`
          - Creates Table: `public.listing_availability`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Admin role for uploads/management
          
          ## Performance Impact:
          - Indexes: Adds indexes to `listing_availability`
          - Triggers: None
          - Estimated Impact: Low
          */

-- 1. Create Storage Bucket for Listing Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing_images', 'listing_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for the new bucket
-- Allow public read access
CREATE POLICY "Allow public read access to listing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing_images');

-- Allow authenticated users (admins) to upload
CREATE POLICY "Allow admin uploads to listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing_images' AND
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Allow authenticated users (admins) to update their own images
CREATE POLICY "Allow admin updates to listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing_images' AND
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Allow authenticated users (admins) to delete their own images
CREATE POLICY "Allow admin deletes from listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing_images' AND
  (select role from public.profiles where id = auth.uid()) = 'admin'
);


-- 3. Create Listing Availability Table
CREATE TABLE public.listing_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    unavailable_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (listing_id, unavailable_date)
);

-- 4. Enable RLS on the new table
ALTER TABLE public.listing_availability ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies for Availability Table
-- Allow public read access
CREATE POLICY "Allow public read access to availability"
ON public.listing_availability FOR SELECT
TO public
USING (true);

-- Allow admins to manage availability
CREATE POLICY "Allow admins to manage availability"
ON public.listing_availability FOR ALL
TO authenticated
USING ((select role from public.profiles where id = auth.uid()) = 'admin')
WITH CHECK ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Add Index for performance
CREATE INDEX idx_listing_availability_listing_id ON public.listing_availability(listing_id);
