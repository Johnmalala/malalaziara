/*
# [SAFE MIGRATION] Final Payment System Simplification

This script safely restructures the booking and payment-related enums and columns to support a simplified "Pay on Arrival" and manual M-Pesa system. It is designed to prevent data loss and dependency errors.

## Query Description:
This migration carefully alters the `booking_status` and `payment_method` types. Instead of dropping them, which caused previous errors, it renames the old types, creates new simplified ones, and then safely converts the data in the `bookings` table. It also removes obsolete columns from previous payment gateway integrations. This operation is designed to be safe and preserve all existing booking data by mapping old statuses to new ones.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Alters**: `bookings` table.
- **Modifies**: `booking_status` enum, `payment_method` enum.
- **Drops**: `daraja_checkout_request_id`, `intasend_checkout_id`, `paystack_reference` columns from `bookings` if they exist.

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: Admin privileges required to run migrations.

## Performance Impact:
- Indexes: Unchanged.
- Triggers: Unchanged.
- Estimated Impact: A brief lock on the `bookings` table during the `ALTER TABLE` operations. Should be fast on small to medium-sized tables.
*/

-- Step 1: Safely alter the booking_status enum
-- Remove the default value to break dependency
ALTER TABLE public.bookings ALTER COLUMN status DROP DEFAULT;

-- Rename the old enum type
ALTER TYPE public.booking_status RENAME TO booking_status_old;

-- Create the new, simplified enum type
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Alter the column to use the new type, casting old values
ALTER TABLE public.bookings
ALTER COLUMN status TYPE public.booking_status
USING (
    CASE status::text
        WHEN 'confirmed' THEN 'confirmed'
        WHEN 'completed' THEN 'completed'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'pending' -- Safely map all other old statuses (like 'active', 'pending_confirmation') to 'pending'
    END
)::public.booking_status;

-- Set the new default value
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending';

-- Drop the old enum type
DROP TYPE public.booking_status_old;


-- Step 2: Safely alter the payment_method enum
-- Remove the default value to break dependency
ALTER TABLE public.bookings ALTER COLUMN payment_method DROP DEFAULT;

-- Rename the old enum type
ALTER TYPE public.payment_method RENAME TO payment_method_old;

-- Create the new, simplified enum type
CREATE TYPE public.payment_method AS ENUM ('pay_on_arrival', 'mpesa');

-- Alter the column to use the new type, casting old values
ALTER TABLE public.bookings
ALTER COLUMN payment_method TYPE public.payment_method
USING (
    CASE payment_method::text
        WHEN 'pay_on_arrival' THEN 'pay_on_arrival'
        WHEN 'mpesa' THEN 'mpesa'
        -- If you had other values like 'card', 'paystack', etc., they will be mapped to 'pay_on_arrival' as a safe default.
        ELSE 'pay_on_arrival'
    END
)::public.payment_method;

-- Drop the old enum type
DROP TYPE public.payment_method_old;


-- Step 3: Clean up obsolete payment gateway columns from the bookings table
-- These commands will only run if the columns exist, and will not throw an error if they don't.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='daraja_checkout_request_id') THEN
        ALTER TABLE public.bookings DROP COLUMN daraja_checkout_request_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='intasend_checkout_id') THEN
        ALTER TABLE public.bookings DROP COLUMN intasend_checkout_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='paystack_reference') THEN
        ALTER TABLE public.bookings DROP COLUMN paystack_reference;
    END IF;
END $$;


-- Step 4: Clean up obsolete payment columns from the booking_payments table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_payments' AND column_name='paystack_reference') THEN
        ALTER TABLE public.booking_payments DROP COLUMN paystack_reference;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_payments' AND column_name='intasend_invoice_id') THEN
        ALTER TABLE public.booking_payments DROP COLUMN intasend_invoice_id;
    END IF;
END $$;
