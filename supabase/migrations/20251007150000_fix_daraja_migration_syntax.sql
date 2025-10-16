/*
# [Migration] Fix Daraja Payment Schema Syntax
This script corrects the syntax for renaming columns to be compatible with PostgreSQL, resolving the migration error. It ensures the database schema is correctly set up for Daraja payments.

## Query Description: 
This operation alters table structures to align with the Daraja payment integration. It safely renames columns on the `bookings` and `booking_payments` tables if they exist. This is a non-destructive change.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifies `bookings` table.
- Modifies `booking_payments` table.
- Modifies `payment_method` enum.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

-- Add 'daraja' as a valid payment method if it doesn't already exist.
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'daraja';

-- Add a column to the bookings table to store Daraja's unique CheckoutRequestID.
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS daraja_checkout_request_id TEXT;

-- Safely rename the generic 'payment_reference' on the bookings table to be Daraja-specific.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='bookings' AND column_name='payment_reference') THEN
    ALTER TABLE public.bookings RENAME COLUMN payment_reference TO daraja_mpesa_receipt;
  END IF;
END $$;

-- Safely rename the 'mpesa_code' on the booking_payments table, which was causing the error.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='booking_payments' AND column_name='mpesa_code') THEN
    ALTER TABLE public.booking_payments RENAME COLUMN mpesa_code TO daraja_mpesa_receipt;
  END IF;
END $$;

-- Also handle renaming 'payment_reference' on the booking_payments table if it exists from a previous integration.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='booking_payments' AND column_name='payment_reference') THEN
    ALTER TABLE public.booking_payments RENAME COLUMN payment_reference TO daraja_checkout_request_id;
  END IF;
END $$;
