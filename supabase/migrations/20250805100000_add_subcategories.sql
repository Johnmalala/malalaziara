/*
# [Migration] Add Sub-Categories and Refactor Categories
This migration introduces sub-categories, renames 'tour' to 'experience', and adds a new 'event' category.

## Query Description:
This script performs several structural changes:
1. Adds 'experience' and 'event' to the `listing_category` enum.
2. Updates all existing 'tour' listings to the new 'experience' category.
3. Adds a `sub_category` text column to the `listings` table.
4. Populates the new `sub_category` field for existing listings with sensible defaults.
This operation is structural and considered safe, but a backup is always recommended before schema changes.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **listing_category (ENUM):** Adds 'experience' and 'event'.
- **listings (TABLE):** Adds `sub_category` column. Updates `category` column values.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges required to run.

## Performance Impact:
- Indexes: An index on `(category, sub_category)` might be beneficial for future filtering.
- Triggers: None
- Estimated Impact: Low. The update will cause a brief table lock on `listings`.
*/

-- Step 1: Add new values to the listing_category enum
-- This must be done before trying to use these values.
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'experience';
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'event';

-- Step 2: Update existing 'tour' listings to 'experience'
-- This is now safe because 'experience' exists in the enum.
UPDATE public.listings
SET category = 'experience'
WHERE category = 'tour';

-- Step 3: Add the new sub_category column to the listings table if it doesn't exist
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Step 4: Populate the sub_category for existing listings with default values
-- This makes the existing data compatible with the new structure.
UPDATE public.listings
SET sub_category = 
  CASE 
    WHEN category = 'experience' THEN 'Safari'
    WHEN category = 'stay' THEN 'Lodge'
    WHEN category = 'volunteer' THEN 'Community'
    ELSE 'General'
  END
WHERE sub_category IS NULL;
