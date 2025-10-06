/*
          # [Operation Name]
          Add Itinerary to Listings

          [This operation adds a new `itinerary` column to the `listings` table to support detailed, day-by-day tour schedules.]

          ## Query Description: [This operation will add a new `itinerary` column of type `jsonb` to the `listings` table. This change is non-destructive and will not affect existing data. The new column will have a default value of an empty array (`[]`), ensuring that existing listings remain valid and functional.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: `public.listings`
          - Column Added: `itinerary` (type: `jsonb`, default: `'[]'::jsonb`)
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. Adding a column with a default value is a fast operation.
          */
ALTER TABLE public.listings
ADD COLUMN itinerary jsonb DEFAULT '[]'::jsonb;
