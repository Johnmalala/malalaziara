/*
# [Operation] Add Description to Custom Package Requests
This migration adds a `description` column to the `custom_package_requests` table to store detailed user requests.

## Query Description:
This is a non-destructive operation that adds a new column to an existing table. It will not affect existing data. The new column will initially be `NULL` for all existing rows.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: `custom_package_requests`
- Column Added: `description` (type: `text`)

## Security Implications:
- RLS Status: Unchanged. Existing policies will apply.
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible performance impact.
*/

ALTER TABLE public.custom_package_requests
ADD COLUMN description TEXT;
