/*
          # [Operation Name]
          Add 'preferred_dates' column to 'custom_package_requests' table

          ## Query Description: [This operation adds a new 'preferred_dates' text column to the 'custom_package_requests' table. This is a non-destructive, structural change required to fix an application error where the custom package form was trying to save data to a non-existent column. This change is safe and will not affect existing data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: "custom_package_requests"
          - Column Added: "preferred_dates" (TEXT)
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. This is a metadata-only change for existing rows.
          */

ALTER TABLE public.custom_package_requests
ADD COLUMN preferred_dates TEXT;
