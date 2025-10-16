/*
# [CRITICAL] Correct Payment Simplification v2
This script safely rebuilds the payment-related enums and columns to support a simplified manual payment flow.

## Query Description:
This migration addresses a dependency error from the previous script. It carefully removes dependencies before dropping and recreating the `booking_status` and `payment_method` enums. It also cleans up unused columns from previous payment integrations.

- **Safety:** This migration alters table structures. It is designed to be safe, but a backup is always recommended.
- **Data Impact:** Existing `status` and `payment_method` values will be preserved where possible. Columns like `payment_reference` and `daraja_checkout_request_id` will be dropped.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Tables Modified:** `bookings`, `booking_payments`
- **Types Modified:** `booking_status`, `payment_method`
- **Columns Dropped:** `payment_reference`, `daraja_checkout_request_id` from `bookings`. `payment_reference` from `booking_payments`.
- **Columns Renamed:** `daraja_mpesa_receipt` to `mpesa_code` in `bookings`.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges required.
*/

BEGIN;

-- Step 1: Remove default value from the 'status' column in 'bookings' to break dependency.
ALTER TABLE public.bookings ALTER COLUMN status DROP DEFAULT;

-- Step 2: Drop the old booking_status enum.
DROP TYPE IF EXISTS public.booking_status;

-- Step 3: Create the new, simplified booking_status enum.
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Step 4: Update existing data to conform to the new enum.
-- Convert any old statuses to 'pending' as a safe default.
UPDATE public.bookings
SET status = 'pending'
WHERE status::text NOT IN ('pending', 'confirmed', 'cancelled', 'completed');

-- Step 5: Alter the 'status' column to use the new enum.
ALTER TABLE public.bookings
ALTER COLUMN status TYPE public.booking_status USING status::text::public.booking_status;

-- Step 6: Set the new default value for the 'status' column.
ALTER TABLE public.bookings
ALTER COLUMN status SET DEFAULT 'pending'::public.booking_status;


-- Step 7: Remove default value from 'payment_method' column in 'bookings'
ALTER TABLE public.bookings ALTER COLUMN payment_method DROP DEFAULT;

-- Step 8: Drop the old payment_method enum.
DROP TYPE IF EXISTS public.payment_method;

-- Step 9: Create the new, simplified payment_method enum.
CREATE TYPE public.payment_method AS ENUM ('pay_on_arrival', 'mpesa');

-- Step 10: Update existing data to conform to the new enum.
-- Convert old payment methods to 'pay_on_arrival' as a safe default.
UPDATE public.bookings
SET payment_method = 'pay_on_arrival'
WHERE payment_method::text NOT IN ('pay_on_arrival', 'mpesa');

-- Step 11: Alter the 'payment_method' column to use the new enum.
ALTER TABLE public.bookings
ALTER COLUMN payment_method TYPE public.payment_method USING payment_method::text::public.payment_method;


-- Step 12: Clean up old, unused columns from previous payment integrations.
-- These checks ensure the script doesn't fail if the columns don't exist.
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_reference') THEN
    ALTER TABLE public.bookings DROP COLUMN "payment_reference";
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='daraja_checkout_request_id') THEN
    ALTER TABLE public.bookings DROP COLUMN "daraja_checkout_request_id";
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='booking_payments' AND column_name='payment_reference') THEN
    ALTER TABLE public.booking_payments DROP COLUMN "payment_reference";
  END IF;
END $$;


-- Step 13: Ensure the mpesa_code column exists and is named correctly.
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='bookings' AND column_name='daraja_mpesa_receipt') THEN
    ALTER TABLE public.bookings RENAME COLUMN "daraja_mpesa_receipt" TO "mpesa_code";
  END IF;
END $$;


COMMIT;
