/*
# Add Paystack Integration Fields to Bookings
This migration adds a new column to the `bookings` table to store the Paystack transaction reference, which is essential for tracking and verifying payments.

## Query Description: This operation adds a new `paystack_reference` column to the `bookings` table. It is a non-destructive change and will not affect existing data. Existing rows will have a `NULL` value for this new column.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column can be dropped)

## Structure Details:
- Table `bookings`:
  - Adds column `paystack_reference` (TEXT)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None added
- Triggers: None added
- Estimated Impact: Negligible performance impact on existing queries.
*/

ALTER TABLE public.bookings
ADD COLUMN paystack_reference TEXT;
