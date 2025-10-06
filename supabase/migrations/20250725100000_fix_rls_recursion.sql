/*
  # [Fix] RLS Infinite Recursion on `profiles` table
  [This migration script resolves an infinite recursion error in the Row Level Security (RLS) policies for the `profiles` table. The previous admin-check policy was causing a loop by selecting from the same table it was protecting. This fix introduces a `SECURITY DEFINER` function to safely retrieve the current user's role without triggering a recursive policy check.]

  ## Query Description: [This operation will create a new helper function (`get_my_role`) and replace the existing RLS policies on the `profiles` table. This is a critical fix to resolve a bug that prevents data from being loaded. There is no risk of data loss. The new policies ensure that users can manage their own profile and admins have full access, but in a non-recursive, performant way.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["High"]
  - Requires-Backup: [false]
  - Reversible: [false]
  
  ## Structure Details:
  - Tables affected: `profiles`
  - Functions created: `get_my_role()`
  - Policies affected: All policies on `profiles`
  
  ## Security Implications:
  - RLS Status: [Enabled]
  - Policy Changes: [Yes, to fix recursion]
  - Auth Requirements: [Requires authenticated user context]
  
  ## Performance Impact:
  - Indexes: [No change]
  - Triggers: [No change]
- Estimated Impact: [High. Resolves a critical performance issue causing query failure.]
*/

-- Step 1: Create a helper function to get the current user's role safely.
-- The `SECURITY DEFINER` setting is crucial here. It makes the function execute with the
-- permissions of the user who defined it (the owner), which bypasses the RLS policy check
-- for the SELECT statement inside the function, thus breaking the infinite recursion.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if a user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;
  
  -- Return the role of the authenticated user
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
EXCEPTION
  -- If the profile doesn't exist or any other error, return a default role
  WHEN OTHERS THEN
    RETURN 'authenticated';
END;
$$;


-- Step 2: Drop the old, recursive policies.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can do anything." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;


-- Step 3: Recreate the policies using the new helper function.

-- Policy 1: Users can see their own profile.
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Admins can see all profiles.
-- This now uses the non-recursive function.
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.get_my_role() = 'admin');

-- Policy 3: Users can update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can update any profile.
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');

-- Policy 5: Users can insert their own profile. This is mainly for completeness
-- as inserts are typically handled by a trigger on `auth.users`.
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 6: Admins can delete profiles.
CREATE POLICY "Admins can delete any profile"
ON public.profiles FOR DELETE
USING (public.get_my_role() = 'admin');
