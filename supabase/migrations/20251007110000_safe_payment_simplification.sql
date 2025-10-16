/*
          # [Safe Schema Simplification]
          This migration safely simplifies the booking and payment-related enums and tables. It replaces the previous, faulty migration scripts.

          ## Query Description: [This script carefully alters the 'bookings' table to remove dependencies on the 'booking_status' and 'payment_method' enums before recreating them with simplified values. This avoids the "cannot drop type because other objects depend on it" error. It also cleans up unused columns from previous payment gateway attempts.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [true]
          - Reversible: [false]
          
          ## Structure Details:
          - Modifies: `bookings` table (status, payment_method columns)
          - Drops: `booking_status` enum, `payment_method` enum
          - Creates: `booking_status` enum, `payment_method` enum (with new values)
          - Drops columns: `intasend_tracking_id`, `daraja_checkout_request_id` from `bookings`
          - Drops column: `intasend_tracking_id` from `booking_payments`
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [No change]
          - Triggers: [No change]
          - Estimated Impact: [Low. The operation will be fast on tables of small to medium size.]
          */

-- Step 1: Safely alter the booking_status enum
ALTER TABLE public.bookings ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.bookings ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS public.booking_status;
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
ALTER TABLE public.bookings ALTER COLUMN status TYPE public.booking_status USING status::booking_status;
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending';

-- Step 2: Safely alter the payment_method enum
ALTER TABLE public.bookings ALTER COLUMN payment_method DROP DEFAULT;
ALTER TABLE public.bookings ALTER COLUMN payment_method TYPE text;
DROP TYPE IF EXISTS public.payment_method;
CREATE TYPE public.payment_method AS ENUM ('pay_on_arrival', 'mpesa');
ALTER TABLE public.bookings ALTER COLUMN payment_method TYPE public.payment_method USING payment_method::public.payment_method;

-- Step 3: Clean up unused columns from previous payment gateway attempts
ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS intasend_tracking_id,
  DROP COLUMN IF EXISTS daraja_checkout_request_id;

ALTER TABLE public.booking_payments
  DROP COLUMN IF EXISTS intasend_tracking_id;

-- Step 4: Rename mpesa_code column in booking_payments for clarity
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='booking_payments' AND column_name='mpesa_code') THEN
    ALTER TABLE public.booking_payments RENAME COLUMN mpesa_code TO transaction_code;
  END IF;
END $$;

-- Step 5: Rename mpesa_code column in bookings for clarity
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='mpesa_code') THEN
    ALTER TABLE public.bookings RENAME COLUMN mpesa_code TO transaction_code;
  END IF;
END $$;
