/*
# [Migration] Switch from Paystack to Intasend
This migration script adapts the database schema to use Intasend as the payment provider instead of Paystack.

## Query Description:
- Renames the `paystack_reference` column to a more generic `payment_reference` in both the `bookings` and `booking_payments` tables. This makes the schema provider-agnostic.
- Adds 'intasend' as a new valid option to the `payment_method` enum type. This allows new bookings to be correctly flagged as using Intasend.
- This operation is structural and should not result in data loss, but backing up your `bookings` and `booking_payments` tables is always recommended before schema changes.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- `bookings` table: `paystack_reference` column renamed to `payment_reference`.
- `booking_payments` table: `paystack_reference` column renamed to `payment_reference`.
- `payment_method` enum: Added 'intasend' value.

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: Admin privileges required to alter tables and types.

## Performance Impact:
- Indexes: Indexes on the renamed columns will be preserved.
- Triggers: Unchanged.
- Estimated Impact: Low. The operation should be fast on tables of small to medium size.
*/

-- Rename column in bookings table
ALTER TABLE public.bookings RENAME COLUMN paystack_reference TO payment_reference;

-- Rename column in booking_payments table
ALTER TABLE public.booking_payments RENAME COLUMN paystack_reference TO payment_reference;

-- Add new value to the payment_method enum
ALTER TYPE public.payment_method ADD VALUE 'intasend';
