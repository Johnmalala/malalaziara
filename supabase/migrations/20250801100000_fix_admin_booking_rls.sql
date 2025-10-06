/*
# [Fix] Update Bookings RLS for Admin View
[This migration updates the Row Level Security (RLS) policy on the 'bookings' table to allow administrators to view all bookings, while regular users can still only see their own. It also creates a helper function to securely check a user's role.]

## Query Description: [This operation modifies the security rules for accessing booking data. It replaces the existing selection policy with a new one that grants broader access to users with an 'admin' role. This is a standard and safe procedure for enabling admin functionality and does not pose a risk to existing data.]

## Metadata:
- Schema-Category: ["Structural", "Security"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables affected: `public.bookings`
- Functions created: `public.get_user_role(uuid)`
- Policies modified: `SELECT` policy on `public.bookings`

## Security Implications:
- RLS Status: [Modified]
- Policy Changes: [Yes] - The `SELECT` policy is being updated to be role-aware.
- Auth Requirements: [Requires authenticated user]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Negligible. The role check function is simple and will have minimal impact on query performance.]
*/

-- Step 1: Create a helper function to get the user's role from the profiles table.
-- This function is created with `SECURITY DEFINER` to allow it to read the profiles table
-- regardless of the calling user's direct permissions.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$;

-- Step 2: Drop any existing SELECT policies on the bookings table to avoid conflicts.
-- It's safe to drop them as we are creating the definitive one next.
DROP POLICY IF EXISTS "Users can view their own bookings." ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings, users can view their own" ON public.bookings;


-- Step 3: Create the new, correct policy.
-- This policy allows a user to see a booking if they are an admin OR if they are the user who created the booking.
CREATE POLICY "Admins can view all bookings, users can view their own"
ON public.bookings
FOR SELECT
USING (
  (get_user_role(auth.uid()) = 'admin') OR (auth.uid() = user_id)
);
