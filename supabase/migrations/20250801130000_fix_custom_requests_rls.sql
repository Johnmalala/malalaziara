/*
# [Fix] RLS for Custom Package Requests
This migration corrects the Row Level Security (RLS) policies for the `custom_package_requests` table to ensure administrators can view and manage all requests.

## Query Description:
This script enables RLS and creates policies that grant admins full access (SELECT, UPDATE, DELETE) while allowing anyone to submit a new request (INSERT). This is a safe operation that only modifies security rules and does not affect existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `custom_package_requests`
- Policies: `Allow public insert`, `Allow admin full access`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. Replaces existing restrictive policies with ones that correctly handle admin access.
- Auth Requirements: Admin role required for viewing/managing requests.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS checks are highly optimized.
*/

-- 1. Enable RLS on the table if not already enabled
ALTER TABLE public.custom_package_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public insert" ON public.custom_package_requests;
DROP POLICY IF EXISTS "Allow admin full access" ON public.custom_package_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.custom_package_requests;
DROP POLICY IF EXISTS "Allow individual read access" ON public.custom_package_requests;

-- 3. Create a policy to allow anyone to insert a new request
CREATE POLICY "Allow public insert"
ON public.custom_package_requests
FOR INSERT
WITH CHECK (true);

-- 4. Create a single policy for admins to have full access
CREATE POLICY "Allow admin full access"
ON public.custom_package_requests
FOR ALL -- Covers SELECT, UPDATE, DELETE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
