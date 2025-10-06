/*
# [Operation Name]
Update a demo booking to use the "Lipa Mdogo Mdogo" payment method.

## Query Description: [This operation safely updates a single existing booking to demonstrate the new installment payment feature. It finds the first booking for the "Serengeti Wildlife Safari" and changes its payment method. No data will be lost.]

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Affects table: `bookings`
- Columns updated: `payment_method`, `status`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [Admin privileges to run the script]

## Performance Impact:
- Indexes: [Uses primary keys]
- Triggers: [No]
- Estimated Impact: [Negligible]
*/
UPDATE public.bookings
SET 
  payment_method = 'lipa_mdogo_mdogo',
  status = 'pending_confirmation'
WHERE id = (
  SELECT b.id
  FROM public.bookings b
  JOIN public.listings l ON b.listing_id = l.id
  WHERE l.title = 'Serengeti Wildlife Safari'
  LIMIT 1
);
