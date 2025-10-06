/*
# [Operation Name]
Update User Profile Creation Logic

## Query Description: [This operation updates the database function responsible for creating a user profile. The change makes the function more robust by providing a fallback value for the user's full name if it is not supplied during account creation (e.g., when an admin adds a user directly in the Supabase dashboard). This prevents errors and ensures a profile is always created successfully. This change is safe and does not affect existing data.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Modifies the `public.handle_new_user` function.

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [Not Applicable]
- Triggers: [Not Applicable]
- Estimated Impact: [None]
*/

-- It's safer to drop the trigger before replacing the function it uses.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Replace the function with a more robust version that handles missing metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    new.id,
    -- Use the full_name from metadata, or fall back to the user's email.
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    -- Use the role from metadata, or fall back to 'user'.
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to call the updated function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
