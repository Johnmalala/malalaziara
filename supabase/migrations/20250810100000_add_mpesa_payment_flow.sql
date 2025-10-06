/*
# [FEATURE] Add M-Pesa Payment Flow Schema
This migration updates the database to support a manual M-Pesa payment confirmation flow.

## Query Description:
This script performs the following non-destructive actions:
1.  Adds 'mpesa' as a new option to the `payment_method` type.
2.  Adds 'pending_confirmation' as a new option to the `booking_status` type.
3.  Adds a new text column `mpesa_code` to the `bookings` table to store M-Pesa transaction codes.

These changes are safe and will not affect existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (with manual steps)

## Structure Details:
- **Types Modified**:
  - `public.payment_method`
  - `public.booking_status`
- **Tables Modified**:
  - `public.bookings`: Adds `mpesa_code` column.

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: None.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible.
*/

-- Step 1: Add 'mpesa' to the payment_method enum.
-- This script assumes the type is named 'payment_method'.
ALTER TYPE public.payment_method ADD VALUE 'mpesa';

-- Step 2: Add 'pending_confirmation' to the booking_status enum.
-- This script assumes the type is named 'booking_status'.
ALTER TYPE public.booking_status ADD VALUE 'pending_confirmation';

-- Step 3: Add the 'mpesa_code' column to the bookings table.
-- This column will store the transaction code provided by the user.
ALTER TABLE public.bookings
ADD COLUMN mpesa_code TEXT;
