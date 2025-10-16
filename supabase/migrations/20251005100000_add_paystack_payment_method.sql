/*
# [Operation Name]
Add Paystack and Installment Payment Methods

[Description of what this operation does]
This migration updates the `payment_method` enum to include 'paystack' and 'lipa_mdogo_mdogo' as valid options. This is necessary to support the new Paystack payment integration for both full and installment payments.

## Query Description: [This operation will expand the accepted values for the payment_method column in the bookings table. It is a non-destructive change and will not affect existing data. No backup is required.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [false]

## Structure Details:
- Type `public.payment_method`: Adds 'paystack' and 'lipa_mdogo_mdogo' values.

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [Not Applicable]
- Triggers: [Not Applicable]
- Estimated Impact: [None]
*/

-- Add 'paystack' to the payment_method enum if it doesn't exist
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'paystack';

-- Add 'lipa_mdogo_mdogo' to the payment_method enum if it doesn't exist
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'lipa_mdogo_mdogo';
