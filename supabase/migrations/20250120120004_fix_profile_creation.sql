/*
  # [Function] handle_new_user
  [This function automatically creates a new row in the `public.profiles` table whenever a new user signs up in `auth.users`.]

  ## Query Description: [This operation creates a function and a trigger to ensure data consistency between your authentication and public user tables. It is a non-destructive, safe operation that prevents errors when fetching profiles for newly registered users. It has no impact on existing data.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: [false]
  - Reversible: [true]
  
  ## Structure Details:
  - Adds function: `public.handle_new_user()`
  - Adds trigger: `on_auth_user_created` on `auth.users`
  
  ## Security Implications:
  - RLS Status: [Not Applicable]
  - Policy Changes: [No]
  - Auth Requirements: [Uses `security definer` to operate across schemas, a standard and secure practice for this use case.]
  
  ## Performance Impact:
  - Indexes: [None]
  - Triggers: [Adds a trigger to `auth.users` insert operations. The impact is negligible.]
  - Estimated Impact: [Low. This is a very fast operation that runs once per user sign-up.]
*/

-- Function to create a new profile for a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- Trigger to call the function after a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
