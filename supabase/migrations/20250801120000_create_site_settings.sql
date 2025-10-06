/*
          # [Operation Name]
          Create Site Assets Bucket and Policies

          ## Query Description: [This migration creates a new storage bucket named `site_assets` for global images like the homepage banner. It also sets the necessary security policies to allow public read access and admin-only write access. This is a non-destructive, structural change.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Creates new storage bucket: `site_assets`
          - Creates new RLS policies for `storage.objects` related to the `site_assets` bucket.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Admin role for write operations.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */
-- Create the storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site_assets', 'site_assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the site_assets bucket
CREATE POLICY "Public can read site assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site_assets');

-- Allow admins to upload to the site_assets bucket
CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'site_assets') AND ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Allow admins to update assets in the site_assets bucket
CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ((bucket_id = 'site_assets') AND ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Allow admins to delete assets from the site_assets bucket
CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
TO authenticated
USING ((bucket_id = 'site_assets') AND ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

/*
          # [Operation Name]
          Secure Site Settings Table

          ## Query Description: [This operation ensures the `site_settings` table has the correct security policies. It allows anyone to read the settings (for display on the public website) but restricts update permissions to administrators only. This is a critical security enhancement.]
          
          ## Metadata:
          - Schema-Category: "Security"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Affects RLS policies on the `public.site_settings` table.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Admin role for write operations.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */
-- Enable RLS on the site_settings table if not already enabled
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;

-- Allow public read access to site settings
CREATE POLICY "Public can read site settings"
ON public.site_settings FOR SELECT
TO public
USING (true);

-- Allow admins to update site settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'))
WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));
