/*
          # Add M-Pesa Payment Flow
          This migration updates the database to support M-Pesa payments, which require manual admin confirmation.

          ## Query Description: This operation is safe and non-destructive. It alters existing ENUM types to add new values and adds a new column to the 'bookings' table to store M-Pesa transaction codes. No existing data will be modified or lost.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Alters ENUM 'payment_method_enum' to add 'mpesa'.
          - Alters ENUM 'payment_status_enum' to add 'pending_confirmation'.
          - Adds column 'mpesa_code' (TEXT) to the 'bookings' table.
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

-- Add 'mpesa' to the payment_method enum
ALTER TYPE public.payment_method_enum ADD VALUE IF NOT EXISTS 'mpesa';

-- Add 'pending_confirmation' to the payment_status enum
ALTER TYPE public.payment_status_enum ADD VALUE IF NOT EXISTS 'pending_confirmation';

-- Add a column to store the M-Pesa transaction code
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS mpesa_code TEXT;

-- Add RLS policy for the new column
-- Ensure existing policies are sufficient or add new ones if needed.
-- For now, we assume existing policies on 'bookings' cover this.
-- Example policy (if needed, but likely covered by existing policies):
-- CREATE POLICY "Allow users to see their own mpesa_code"
-- ON public.bookings FOR SELECT
-- USING (auth.uid() = user_id);
