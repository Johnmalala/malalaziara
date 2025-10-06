/*
# [Operation] Grant Admin Privileges
This script updates a specific user's role to 'admin', granting them full administrative access to the application's admin portal.

## Query Description:
This operation targets the `profiles` table and changes the `role` column for a single user identified by their email address. It is a safe, targeted update that does not affect other users or data.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Can be reversed by setting the role back to 'user')

## Structure Details:
- Table: public.profiles
- Column: role
- Condition: email = 'admin@ziarazetu.com'

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: This grants significant privileges to the specified user. Ensure the account is secure.

## Performance Impact:
- Indexes: Uses existing index on the email column for fast lookup.
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@ziarazetu.com';
