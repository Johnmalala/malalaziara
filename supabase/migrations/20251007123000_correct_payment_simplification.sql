/*
          # [Operation Name]
          Correct and Finalize Payment System Simplification

          ## Query Description: [This script provides a safe and robust way to simplify the payment system to use only "Pay on Arrival" and manual "M-Pesa" methods. It corrects previous migration errors by safely dropping old tables and columns, and correctly recreating the necessary 'booking_status' and 'payment_method' types. This operation is destructive to old, unused payment-related data (e.g., payment references from Intasend/Daraja) but preserves core booking information.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Drops table: `booking_payments`
          - Drops columns from `bookings`: `payment_reference`, `daraja_checkout_request_id`, `daraja_mpesa_receipt`
          - Adds column to `bookings`: `mpesa_code`
          - Recreates enums: `booking_status`, `payment_method`
          
          ## Security Implications:
          - RLS Status: [No Change]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [No Change]
          - Triggers: [No Change]
          - Estimated Impact: [Low. The operation will be fast on tables of small to medium size.]
          */

-- Step 1: Drop the booking_payments table if it exists.
DROP TABLE IF EXISTS public.booking_payments;

-- Step 2: Safely remove old payment provider columns from the bookings table.
ALTER TABLE public.bookings
DROP COLUMN IF EXISTS "payment_reference",
DROP COLUMN IF EXISTS "daraja_checkout_request_id",
DROP COLUMN IF EXISTS "daraja_mpesa_receipt";

-- Step 3: Ensure the mpesa_code column exists for manual entry.
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS "mpesa_code" text;

-- Step 4: Safely recreate the booking_status enum with simplified values.
-- Temporarily convert to text to allow dropping the old enum type.
ALTER TABLE public.bookings ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS public.booking_status;

-- Create the new, simplified enum.
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Update any non-conforming data to a safe default ('pending').
UPDATE public.bookings
SET status = 'pending'
WHERE status NOT IN ('pending', 'confirmed', 'cancelled', 'completed');

-- Convert the column back to the new enum type.
ALTER TABLE public.bookings ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status;

-- Step 5: Safely recreate the payment_method enum with simplified values.
-- Temporarily convert to text.
ALTER TABLE public.bookings ALTER COLUMN payment_method TYPE text;
DROP TYPE IF EXISTS public.payment_method;

-- Create the new, simplified enum.
CREATE TYPE public.payment_method AS ENUM ('pay_on_arrival', 'mpesa');

-- Update any non-conforming data to a safe default ('pay_on_arrival').
UPDATE public.bookings
SET payment_method = 'pay_on_arrival'
WHERE payment_method NOT IN ('pay_on_arrival', 'mpesa');

-- Convert the column back to the new enum type.
ALTER TABLE public.bookings ALTER COLUMN payment_method TYPE public.payment_method USING payment_method::public.payment_method;

-- Step 6: Rename payment_status column on bookings table if it exists
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_status') THEN
      ALTER TABLE public.bookings DROP COLUMN "payment_status";
   END IF;
END $$;
