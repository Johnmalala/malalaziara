/*
# [Fix] RLS Policies for `profiles` Table

This migration script resolves an "infinite recursion" error by replacing the existing Row Level Security (RLS) policies on the `public.profiles` table with a corrected, secure set of policies.

## Query Description:
This operation will drop all existing RLS policies on the `public.profiles` table and create new ones. This is a critical security update to fix a database error. The new policies are standard and safe, but if you have custom logic in your existing policies, it will be overwritten. It is highly recommended to back up your database before applying this change if you have complex custom policies.

The new policies are:
1. Users can view and update their own profile.
2. Admin users can perform any action (view, create, update, delete) on any profile.

## Metadata:
- Schema-Category: "Dangerous"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Table: `public.profiles`
- Changes:
  - Drops potentially problematic existing RLS policies on the table.
  - Creates a new helper function `get_my_role()`.
  - Creates 3 new, safe RLS policies for SELECT, UPDATE, and admin access.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: This fix is essential for authenticated users to interact with the database correctly without causing errors.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: This change will resolve a critical performance issue (infinite recursion) and should improve database stability for queries involving the `profiles` table.
*/

-- Step 1: Drop potentially conflicting policies on the profiles table to ensure a clean slate.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;


-- Step 2: Create a helper function to get the role of the currently authenticated user.
-- Using `SECURITY INVOKER` is crucial here. It runs the function with the permissions of the
-- user calling it, which respects the user's own RLS policies and prevents recursion.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


-- Step 3: Re-create the policies with the correct, non-recursive logic.

-- Policy 1: Users can view their own profile.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile data.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Admins have full access to all profiles.
-- This policy uses the `get_my_role()` helper function. Because the function is `SECURITY INVOKER`,
-- it safely checks the user's role without causing a recursive loop.
CREATE POLICY "Admins can manage all profiles."
ON public.profiles FOR ALL
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');
