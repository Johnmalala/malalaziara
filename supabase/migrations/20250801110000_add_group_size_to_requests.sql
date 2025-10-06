/*
  # [Structural] Add 'group_size' to Custom Package Requests

  ## Query Description: 
  This operation adds a new `group_size` column to the `custom_package_requests` table. This is a non-destructive change required to store the number of travelers for each custom request, fixing an error where the application was trying to save data to a non-existent column.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (by dropping the column)

  ## Structure Details:
  - Table: `custom_package_requests`
  - Column Added: `group_size` (integer, NOT NULL, default 1)

  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: None

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Minimal. Adding a column with a default value may cause a brief table lock on very large tables, but it is expected to be fast for this use case.
*/

ALTER TABLE public.custom_package_requests
ADD COLUMN group_size INTEGER NOT NULL DEFAULT 1;
