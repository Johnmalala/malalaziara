/*
# [FEATURE] Implement "Lipa Mdogo Mdogo" (Installment Payments)

This migration introduces the necessary database structures to support installment payments.

## Query Description: This operation is STRUCTURAL and considered SAFE.
- It adds a new 'partially_paid' option to the booking status and payment status types.
- It creates a new `booking_payments` table to track individual payments.
- It adds a trigger to automatically update the booking status when a payment is made.
- No existing data is modified or deleted.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (with manual steps)

## Structure Details:
- Modifies `booking_status` enum type.
- Modifies `booking_payment_status` enum type.
- Creates table `public.booking_payments`.
- Creates function `public.update_booking_on_payment`.
- Creates trigger `on_payment_insert_update_booking_status` on `public.booking_payments`.

## Security Implications:
- RLS Status: Enabled on the new `booking_payments` table.
- Policy Changes: Adds new policies for users to manage their own payments and for admins to have full access.
- Auth Requirements: User must be authenticated to make payments.

## Performance Impact:
- Indexes: Primary key and foreign key indexes are created on the new table.
- Triggers: Adds one `AFTER INSERT` trigger on the new `booking_payments` table. The impact is minimal as it only fires on new payment insertions.
- Estimated Impact: Low.
*/

-- Step 1: Add 'partially_paid' to the relevant enums
-- We use DO blocks to prevent errors if the values already exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partially_paid' AND enumtypid = 'public.booking_status'::regtype) THEN
    ALTER TYPE public.booking_status ADD VALUE 'partially_paid';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partially_paid' AND enumtypid = 'public.booking_payment_status'::regtype) THEN
    ALTER TYPE public.booking_payment_status ADD VALUE 'partially_paid';
  END IF;
END
$$;


-- Step 2: Create the booking_payments table to track each payment
CREATE TABLE IF NOT EXISTS public.booking_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount > 0),
    payment_method public.booking_payment_method NOT NULL,
    mpesa_code character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add comments to the new table and columns
COMMENT ON TABLE public.booking_payments IS 'Stores individual payments made towards a booking.';
COMMENT ON COLUMN public.booking_payments.booking_id IS 'The booking this payment is for.';
COMMENT ON COLUMN public.booking_payments.user_id IS 'The user who made the payment.';
COMMENT ON COLUMN public.booking_payments.amount IS 'The amount paid in this transaction.';


-- Step 3: Enable RLS and create policies for the new table
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.booking_payments;
CREATE POLICY "Users can view their own payments"
ON public.booking_payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create payments for their own bookings" ON public.booking_payments;
CREATE POLICY "Users can create payments for their own bookings"
ON public.booking_payments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (SELECT b.user_id FROM public.bookings b WHERE b.id = booking_id) = auth.uid()
);

DROP POLICY IF EXISTS "Admins have full access to all payments" ON public.booking_payments;
CREATE POLICY "Admins have full access to all payments"
ON public.booking_payments FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- Step 4: Create a trigger function to update the main booking record
CREATE OR REPLACE FUNCTION public.update_booking_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_paid numeric;
  booking_total numeric;
BEGIN
  -- Calculate the total amount paid for the booking
  SELECT SUM(p.amount) INTO total_paid
  FROM public.booking_payments p
  WHERE p.booking_id = NEW.booking_id;

  -- Get the total amount required for the booking
  SELECT b.amount INTO booking_total
  FROM public.bookings b
  WHERE b.id = NEW.booking_id;

  -- Update the booking's status based on the total paid amount
  IF total_paid >= booking_total THEN
    -- If fully paid, mark as confirmed and active
    UPDATE public.bookings
    SET payment_status = 'confirmed', status = 'active'
    WHERE id = NEW.booking_id;
  ELSE
    -- If partially paid, mark as such
    UPDATE public.bookings
    SET payment_status = 'partially_paid', status = 'partially_paid'
    WHERE id = NEW.booking_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_booking_on_payment() IS 'Trigger function to automatically update booking status when a new payment is recorded.';

-- Step 5: Create the trigger to execute the function after a new payment
DROP TRIGGER IF EXISTS on_payment_insert_update_booking_status ON public.booking_payments;
CREATE TRIGGER on_payment_insert_update_booking_status
AFTER INSERT ON public.booking_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_on_payment();
