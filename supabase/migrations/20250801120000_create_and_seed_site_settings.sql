/*
          # [Operation Name]
          Create and Seed Site Settings Table

          ## Query Description: [This operation will create the `site_settings` table from scratch and populate it with default values for your website's banner, contact info, and authentication page images. This ensures the admin settings page is pre-filled with the correct live data. WARNING: This will delete any existing `site_settings` table to ensure a clean setup.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Creates table: `public.site_settings`
          - Adds columns: `banner_url`, `banner_title`, `banner_subtitle`, `contact_email`, `contact_phone`, `address`, `signin_image_url`, `signup_image_url`
          - Inserts one row of default data.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Admin role for updates.
          
          ## Performance Impact:
          - Indexes: Adds primary key index.
          - Triggers: None
          - Estimated Impact: Low
          */

-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.site_settings;

-- Create the site_settings table
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  banner_url TEXT,
  banner_title TEXT,
  banner_subtitle TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  signin_image_url TEXT,
  signup_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the table with default values, including the URLs of the current images
INSERT INTO public.site_settings (
  id,
  banner_title,
  banner_subtitle,
  banner_url,
  contact_email,
  contact_phone,
  address,
  signin_image_url,
  signup_image_url
) VALUES (
  '1',
  'Discover East Africa',
  'Premium tours, luxury stays, and meaningful volunteer experiences.',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1920&h=1080',
  'info@ziarazetu.com',
  '+254 700 123 456',
  'Mombasa, Kenya',
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=1000&fit=crop'
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
CREATE POLICY "Allow public read access"
ON public.site_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin update access" ON public.site_settings;
CREATE POLICY "Allow admin update access"
ON public.site_settings
FOR UPDATE
USING (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
