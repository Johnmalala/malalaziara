/*
  # [Operation Name]
  Fix Booking Status Enum

  [Description of what this operation does]
  This migration corrects the `booking_status` enum by adding missing values ('active', 'completed', 'cancelled') to align it with the application's requirements. This resolves schema mismatches that cause errors during data seeding or booking operations.

  ## Query Description: [This operation safely adds new values to the existing `booking_status` enum. It is non-destructive, will not affect existing data, and is necessary for the booking system to function correctly. The queries are idempotent, meaning they can be run multiple times without causing errors.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: [false]
  - Reversible: [false]
  
  ## Structure Details:
  - Affects enum: `booking_status` by adding values.
  
  ## Security Implications:
  - RLS Status: [Not Applicable]
  - Policy Changes: [No]
  - Auth Requirements: [None]
  
  ## Performance Impact:
  - Indexes: [Not Applicable]
  - Triggers: [Not Applicable]
  - Estimated Impact: [None]
*/

-- This script ensures all required values exist in the 'booking_status' enum.
-- It is safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'active' AND enumtypid = 'public.booking_status'::regtype) THEN
    ALTER TYPE public.booking_status ADD VALUE 'active';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = 'public.booking_status'::regtype) THEN
    ALTER TYPE public.booking_status ADD VALUE 'completed';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = 'public.booking_status'::regtype) THEN
    ALTER TYPE public.booking_status ADD VALUE 'cancelled';
  END IF;
END
$$;
