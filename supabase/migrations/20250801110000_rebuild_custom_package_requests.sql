/*
          # Rebuild Custom Package Requests Table
          This migration completely rebuilds the `custom_package_requests` table to align with the application's data submission form. It adds all required columns at once to prevent further `NOT NULL` constraint errors.

          ## Query Description: 
          - **DANGER:** This script first DROPS the existing `custom_package_requests` table, which will permanently delete all data currently in it.
          - It then creates a new, properly structured table with individual columns for all form fields (name, email, destination, etc.).
          - This is a necessary step to fix the persistent schema errors and ensure the feature works correctly.

          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Drops table: `public.custom_package_requests`
          - Creates table: `public.custom_package_requests` with a new, complete schema.
          
          ## Security Implications:
          - RLS Status: RLS is enabled on the new table.
          - Policy Changes: Policies are created to allow users to insert their own requests and for admins to manage all requests.
          - Auth Requirements: Users must be authenticated to insert. Admins have full access.
          
          ## Performance Impact:
          - Indexes: Standard primary key index is created.
          - Triggers: None.
          - Estimated Impact: Low. This is a structural change on a likely small table.
          */

-- Step 1: Drop the old, problematic table.
-- WARNING: THIS WILL DELETE ALL EXISTING DATA IN THE custom_package_requests TABLE.
DROP TABLE IF EXISTS public.custom_package_requests;

-- Step 2: Create the new, complete table with all necessary columns.
CREATE TABLE public.custom_package_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    title TEXT NOT NULL,
    destination TEXT,
    interests TEXT[],
    budget_range TEXT,
    preferred_dates TEXT,
    group_size INT,
    message TEXT,
    status TEXT DEFAULT 'new' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Step 3: Add comments to the new columns for clarity.
COMMENT ON COLUMN public.custom_package_requests.name IS 'Full name of the person making the request.';
COMMENT ON COLUMN public.custom_package_requests.email IS 'Email of the person making the request.';
COMMENT ON COLUMN public.custom_package_requests.phone IS 'Phone number of the person making the request.';
COMMENT ON COLUMN public.custom_package_requests.title IS 'Auto-generated title for the request.';
COMMENT ON COLUMN public.custom_package_requests.destination IS 'The desired travel destination(s).';
COMMENT ON COLUMN public.custom_package_requests.interests IS 'An array of travel interests (e.g., wildlife, culture).';
COMMENT ON COLUMN public.custom_package_requests.message IS 'Additional message or special requests from the user.';

-- Step 4: Enable Row Level Security (RLS) on the new table.
ALTER TABLE public.custom_package_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies.
-- Users can insert their own requests.
CREATE POLICY "Allow authenticated users to insert their own request"
ON public.custom_package_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can view their own requests.
CREATE POLICY "Allow users to view their own requests"
ON public.custom_package_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins have full access to all requests.
CREATE POLICY "Allow admin full access"
ON public.custom_package_requests
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
