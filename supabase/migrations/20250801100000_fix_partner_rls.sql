/*
# [MIGRATION] Fix Partner Management Permissions

This migration script adjusts the Row Level Security (RLS) policies for the `partners` table to resolve an issue where administrators were unable to create new partners.

## Query Description:
The existing security rules are too restrictive, preventing even admin accounts from adding new records. This script will replace the current policies with new ones that grant administrators full control (create, read, update, delete) over the `partners` table, while allowing all authenticated users to view the partners. This ensures that the admin dashboard functionality works as expected. This operation is safe and does not risk any data loss.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `public.partners`
- Operations: `ALTER TABLE`, `DROP POLICY`, `CREATE POLICY`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. Replaces existing policies on `public.partners`.
- Auth Requirements: Policies are based on the user's role in the `public.profiles` table.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact. The policy checks are efficient.
*/

-- Step 1: Enable Row Level Security on the 'partners' table if it's not already.
-- This ensures that the policies we define below will be enforced.
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Step 2: Remove any existing policies on the table to start fresh.
-- This prevents conflicts with old or default policies.
DROP POLICY IF EXISTS "Allow admin full access to partners" ON public.partners;
DROP POLICY IF EXISTS "Allow authenticated read access to partners" ON public.partners;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.partners; -- A common default policy name

-- Step 3: Create a policy to give administrators full control.
-- This allows users with the 'admin' role to do anything with the partners table.
CREATE POLICY "Allow admin full access to partners"
ON public.partners
FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Step 4: Create a policy to allow any authenticated user to view partners.
-- This is useful for displaying partner logos or information on the public site.
CREATE POLICY "Allow authenticated read access to partners"
ON public.partners
FOR SELECT
TO authenticated
USING (true);
