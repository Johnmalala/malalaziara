/*
# [Operation] Make User Admin
This script elevates a specific user to an 'admin' role by updating their profile.

## Query Description:
- This query targets the `public.profiles` table.
- It finds the user with the email 'admin@ziarazetu.com' in the `auth.users` table.
- It then updates the `role` column of that user's corresponding profile to 'admin'.
- This operation is safe and will only affect a single user record.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (Manually change the role back to 'user')

## Structure Details:
- Table Affected: `public.profiles`
- Column Affected: `role`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Grants admin privileges to the specified user.

## Performance Impact:
- Indexes: Uses primary keys, minimal impact.
- Triggers: None
- Estimated Impact: Low
*/

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'admin@ziarazetu.com'
  LIMIT 1
);
