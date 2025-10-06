/*
# [Operation Name]
Add Sign-In and Sign-Up Images to Site Settings

## Query Description: [This operation adds two new columns, `signin_image_url` and `signup_image_url`, to the `site_settings` table. These columns will store the URLs for the background images on the authentication pages, allowing them to be customized from the admin dashboard. This change is non-destructive and will not affect existing data.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: site_settings
- Columns Added:
  - signin_image_url (TEXT)
  - signup_image_url (TEXT)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Adds two new text columns to a single-row table.
*/

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS signin_image_url TEXT,
ADD COLUMN IF NOT EXISTS signup_image_url TEXT;

-- Add comments for clarity in the database schema
COMMENT ON COLUMN public.site_settings.signin_image_url IS 'URL for the background image on the Sign In page.';
COMMENT ON COLUMN public.site_settings.signup_image_url IS 'URL for the background image on the Sign Up page.';
