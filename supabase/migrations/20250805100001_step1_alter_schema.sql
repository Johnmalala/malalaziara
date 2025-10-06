/*
# [Migration Step 1: Alter Schema]
This script modifies the database structure to support new categories and sub-categories.
It MUST be run and committed before Step 2.

## Query Description: This operation alters the 'listing_category' type to include 'experience' and 'event', and adds a 'sub_category' column to the 'listings' table. This is a structural change and is safe to run on its own.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false (without data loss)

## Structure Details:
- Modifies ENUM: public.listing_category
- Modifies TABLE: public.listings (adds column)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. The operation is fast.
*/

-- Add 'experience' and 'event' to the listing_category enum type.
-- This is done safely without locking the table for reads.
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'experience';
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'event';

-- Add the new sub_category column to the listings table.
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS sub_category TEXT;
