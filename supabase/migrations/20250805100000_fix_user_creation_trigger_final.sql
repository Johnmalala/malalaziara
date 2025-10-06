/*
# [Fix] Rebuild User Profile Creation Trigger
This script completely rebuilds the database function and trigger responsible for creating a user's profile after they sign up. It fixes a syntax error in the previous version and ensures the process is robust and secure.

## Query Description:
1.  **Drops existing function/trigger**: Removes the old, faulty `handle_new_user` function and its associated trigger `on_auth_user_created` to prevent conflicts.
2.  **Creates a new function**: Defines a new `handle_new_user` function that correctly inserts a new record into `public.profiles` using the data from the newly signed-up user in `auth.users`.
3.  **Sets `SECURITY DEFINER`**: The function is created with `SECURITY DEFINER` privileges, allowing it to bypass Row Level Security during the initial profile creation. This is the key to fixing the "database error creating new user" issue.
4.  **Creates a new trigger**: Sets up a new trigger that automatically runs the function after a new user is added to `auth.users`.
5.  **Sets Permissions**: Ensures the necessary roles can execute the function.

This operation is safe and will not affect existing user data. It only corrects the automated process for new user sign-ups.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the new trigger/function)
*/

-- Step 1: Drop the old trigger and function if they exist to ensure a clean slate.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the function that will be run by the trigger.
-- This function inserts a new row into public.profiles.
-- It is defined with `SECURITY DEFINER` to bypass RLS during insertion.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    'user' -- Default role for all new sign-ups
  );
  RETURN new;
END;
$$;

-- Step 3: Create the trigger that calls the function.
-- This trigger fires every time a new user is added to the auth.users table.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant execute permission on the function to the 'authenticated' role
-- While the trigger runs as the definer, this is good practice for functions that might be called elsewhere.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
