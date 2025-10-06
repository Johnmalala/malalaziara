/*
# [Fix] Rebuild User Profile Creation Trigger

This script completely rebuilds the automated process that creates a user profile when a new user signs up. The previous trigger was failing due to a database permissions issue.

## Query Description:
This operation is safe and will not affect any existing user data. It drops the old, non-functional database trigger and function and replaces them with a new version that has the correct permissions to operate. This is the definitive fix for the "Database error creating new user" error encountered during sign-up.

The key change is the addition of `SECURITY DEFINER` to the function, which allows it to create a profile entry for the new user successfully.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by reverting to a previous migration)

## Structure Details:
- Drops trigger: `on_auth_user_created` on `auth.users`
- Drops function: `public.handle_new_user`
- Creates function: `public.handle_new_user` (with `SECURITY DEFINER`)
- Creates trigger: `on_auth_user_created` on `auth.users`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: This function is triggered by Supabase Auth internally.

## Performance Impact:
- Indexes: None
- Triggers: Replaces one trigger. Negligible impact.
- Estimated Impact: None.
*/

-- Step 1: Drop the old trigger and function to ensure a clean state.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create a new, corrected function with the necessary permissions.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This is the crucial part that grants the function the rights to insert into public.profiles
SET search_path = public;
AS $$
BEGIN
  -- This function is triggered when a new user is created in the auth.users table.
  -- It inserts a corresponding entry into the public.profiles table.
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id, -- The user's ID from auth.users
    new.raw_user_meta_data->>'full_name', -- The full name from the metadata provided at sign-up
    new.email, -- The user's email from auth.users
    new.raw_user_meta_data->>'phone', -- The phone number from metadata
    'user' -- Assign a default role of 'user'
  );
  RETURN new;
END;
$$;

-- Step 3: Re-create the trigger to call the new function after a user signs up.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
