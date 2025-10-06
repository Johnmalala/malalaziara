/*
# [Migration Step 2: Update Data]
This script updates existing data to use the new schema structure.
It MUST be run ONLY AFTER Step 1 has been successfully committed.

## Query Description: This operation updates the 'category' for existing tours to 'experience' and populates the new 'sub_category' column with default values for all listings. This modifies existing data but is designed to be safe.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: true (manually)

## Structure Details:
- Updates TABLE: public.listings (category and sub_category columns)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges

## Performance Impact:
- Indexes: May trigger index updates.
- Triggers: Unchanged
- Estimated Impact: Low to Medium, depending on the number of listings.
*/

-- Update existing 'tour' listings to the new 'experience' category.
UPDATE public.listings
SET category = 'experience'
WHERE category = 'tour';

-- Assign default sub-categories to existing listings for data consistency.
UPDATE public.listings
SET sub_category = 
    CASE 
        WHEN category = 'experience' THEN 'safaris'
        WHEN category = 'stay' THEN 'lodges'
        WHEN category = 'volunteer' THEN 'community'
        ELSE 'general'
    END
WHERE sub_category IS NULL;
