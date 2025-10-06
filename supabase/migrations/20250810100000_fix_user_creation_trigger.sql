--
    -- # [Fix User Profile Creation Trigger]
    -- This script rebuilds the automated process that creates a user profile
    -- after a successful sign-up. It replaces the existing, faulty trigger
    -- with a new, robust version that has the correct permissions to operate
    -- without being blocked by Row Level Security.
    --
    -- ## Query Description:
    -- This operation is safe and will not affect existing user data. It only
    -- modifies the underlying database functions responsible for new user
    -- creation. No backups are required, but this is critical for fixing the
    -- sign-up functionality.
    --
    -- ## Metadata:
    -- - Schema-Category: "Structural"
    -- - Impact-Level: "Low"
    -- - Requires-Backup: false
    -- - Reversible: true
    --
    -- ## Structure Details:
    -- - Drops and recreates the `handle_new_user` function.
    -- - Drops and recreates the `on_auth_user_created` trigger on `auth.users`.
    -- - Re-applies safe RLS policies to the `public.profiles` table.
    --
    -- ## Security Implications:
    -- - RLS Status: Enabled
    -- - Policy Changes: Yes (re-applies existing safe policies)
    -- - Auth Requirements: None
    --
    -- ## Performance Impact:
    -- - Indexes: None
    -- - Triggers: Modified
    -- - Estimated Impact: Negligible
    --
    
    -- Step 1: Drop the old trigger and function to ensure a clean setup.
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    -- Step 2: Create the function that handles new user profile creation.
    -- Using `SECURITY DEFINER` ensures it runs with the necessary permissions
    -- to insert into the public.profiles table, bypassing any RLS that would
    -- block a new user from creating their own profile.
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      -- Insert a new row into public.profiles, pulling metadata from the
      -- `raw_user_meta_data` field of the new user record in `auth.users`.
      INSERT INTO public.profiles (id, email, full_name, phone, role)
      VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'role'
      );
      RETURN new;
    END;
    $$;
    
    -- Step 3: Create the trigger to execute the function after a new user signs up.
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    
    -- Step 4: Ensure RLS is enabled and policies are correct for ongoing use.
    -- This doesn't affect the trigger but is good practice.
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies to prevent conflicts.
    DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    
    -- Re-create policies for SELECT and UPDATE. An INSERT policy is not needed
    -- for users, as the trigger handles it.
    CREATE POLICY "Users can view their own profile."
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
    
    CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
