/*
          # [Operation Name]
          Update Stay Listing to Airbnb Sub-Category

          ## Query Description:
          This script updates an existing 'stay' listing to use the new 'airbnb' sub-category. This ensures that the new filter option on the frontend has data to display. No data will be lost.

          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Table: listings
          - Column: sub_category

          ## Security Implications:
          - RLS Status: Not changed
          - Policy Changes: No
          - Auth Requirements: Admin privileges to run the script.

          ## Performance Impact:
          - Indexes: Not affected
          - Triggers: Not affected
          - Estimated Impact: Negligible. Affects a single row.
          */

UPDATE public.listings
SET sub_category = 'airbnb'
WHERE title = 'Serene Garden Apartment' AND category = 'stay';
