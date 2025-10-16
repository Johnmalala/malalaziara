/*
  # [FINAL SAFE MIGRATION] Payment System Simplification

  This script safely transitions the database to a simplified payment model
  (Pay on Arrival & Manual M-Pesa) by carefully altering table structures
  to avoid dependency errors. It correctly handles existing data.

  ## Query Description:
  This operation modifies the `bookings` table and related data types.
  It first converts columns using enums to text to remove dependencies,
  updates the data (e.g., maps 'active' status to 'confirmed'), recreates
  the enums with simplified values, and then converts the columns back to
  the new enum types. This is a safe but structural change.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: true
  - Reversible: false
*/

BEGIN;

-- Step 1: Handle `booking_status` enum
-- Remove default value constraint to avoid issues
ALTER TABLE public.bookings ALTER COLUMN status DROP DEFAULT;

-- Convert column to text to break dependency on the enum
ALTER TABLE public.bookings ALTER COLUMN status TYPE text;

-- Update old status values to the new simplified ones.
-- This is the key fix for the 'invalid input value for enum booking_status: "active"' error.
UPDATE public.bookings SET status = 'confirmed' WHERE status IN ('active', 'pending_confirmation');
UPDATE public.bookings SET status = 'pending' WHERE status IS NULL; -- Ensure no nulls

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS public.booking_status;

-- Create the new, simplified enum type
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Convert the column back to the new enum type
ALTER TABLE public.bookings ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status;

-- Restore default value
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending';


-- Step 2: Handle `payment_method` enum
-- Convert column to text to break dependency
ALTER TABLE public.bookings ALTER COLUMN payment_method TYPE text;

-- Update old payment methods to 'mpesa' as a safe default.
UPDATE public.bookings SET payment_method = 'mpesa' WHERE payment_method IN ('paystack', 'intasend', 'daraja');

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS public.payment_method;

-- Create the new, simplified enum type
CREATE TYPE public.payment_method AS ENUM ('pay_on_arrival', 'mpesa');

-- Convert the column back to the new enum type
ALTER TABLE public.bookings ALTER COLUMN payment_method TYPE public.payment_method USING payment_method::public.payment_method;


-- Step 3: Clean up unused columns from previous payment integrations
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='paystack_reference') THEN
    ALTER TABLE public.bookings DROP COLUMN paystack_reference;
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='intasend_reference') THEN
    ALTER TABLE public.bookings DROP COLUMN intasend_reference;
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='daraja_checkout_request_id') THEN
    ALTER TABLE public.bookings DROP COLUMN daraja_checkout_request_id;
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='daraja_mpesa_receipt') THEN
    ALTER TABLE public.bookings RENAME COLUMN daraja_mpesa_receipt TO transaction_code;
  END IF;
END $$;

COMMIT;
