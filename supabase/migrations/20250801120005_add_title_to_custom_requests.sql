/*
# [Structural] Add Title to Custom Package Requests
This migration adds a `title` column to the `custom_package_requests` table to store a summary of the request.

## Query Description: 
This is a non-destructive operation that adds a new `title` column of type TEXT to the `custom_package_requests` table. Existing rows will have a NULL value for this new column, which is safe. The application code has been updated to populate this field for new requests.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the column)

## Structure Details:
- Table: `custom_package_requests`
- Column Added: `title` (TEXT)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added
- Triggers: None added
- Estimated Impact: Negligible. Adding a nullable column is a fast metadata-only change in PostgreSQL.
*/
ALTER TABLE public.custom_package_requests
ADD COLUMN title TEXT;
