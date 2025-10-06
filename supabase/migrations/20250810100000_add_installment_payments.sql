/*
          # [Operation Name]
          Create Installment Payment System

          ## Query Description: [This script adds the necessary database structures to support a "Lipa Mdogo Mdogo" (pay in installments) feature. It creates a new table `booking_payments` to track individual payments for each booking, adds a 'partially_paid' status to the booking lifecycle, and implements a database trigger to automatically update the booking's payment status as new payments are recorded. This operation is safe and does not affect existing data.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Adds new table: `public.booking_payments`
          - Adds new enum value: `partially_paid` to `booking_status_enum`
          - Adds new function: `public.update_booking_payment_status()`
          - Adds new trigger: `on_payment_insert` on `booking_payments` table
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [User must be authenticated to add payments. Admin has full access.]
          
          ## Performance Impact:
          - Indexes: [Primary key and foreign key indexes are created.]
          - Triggers: [Adds a new trigger on the `booking_payments` table.]
          - Estimated Impact: [Low. The trigger fires only on new payment insertions.]
          */

-- Add 'partially_paid' to the booking status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partially_paid' AND enumtypid = 'public.booking_status_enum'::regtype) THEN
    ALTER TYPE public.booking_status_enum ADD VALUE 'partially_paid';
  END IF;
END$$;

-- Create the table to store individual payments for bookings
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  transaction_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

-- Policies for booking_payments table
DROP POLICY IF EXISTS "Users can view their own payments." ON public.booking_payments;
CREATE POLICY "Users can view their own payments."
ON public.booking_payments FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.bookings WHERE id = booking_payments.booking_id));

DROP POLICY IF EXISTS "Users can insert payments for their bookings." ON public.booking_payments;
CREATE POLICY "Users can insert payments for their bookings."
ON public.booking_payments FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM public.bookings WHERE id = booking_payments.booking_id));

DROP POLICY IF EXISTS "Admins can manage all payments." ON public.booking_payments;
CREATE POLICY "Admins can manage all payments."
ON public.booking_payments FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Function to update booking status based on payments
CREATE OR REPLACE FUNCTION public.update_booking_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_paid NUMERIC;
  total_booking_amount NUMERIC;
BEGIN
  -- Calculate the sum of all payments for the booking
  SELECT SUM(amount_paid) INTO total_paid
  FROM public.booking_payments
  WHERE booking_id = NEW.booking_id;

  -- Get the total amount for the booking
  SELECT amount INTO total_booking_amount
  FROM public.bookings
  WHERE id = NEW.booking_id;

  -- Update the booking status
  IF total_paid >= total_booking_amount THEN
    UPDATE public.bookings
    SET payment_status = 'confirmed', status = 'active'
    WHERE id = NEW.booking_id;
  ELSE
    UPDATE public.bookings
    SET payment_status = 'partially_paid'
    WHERE id = NEW.booking_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new payment is inserted
DROP TRIGGER IF EXISTS on_payment_insert ON public.booking_payments;
CREATE TRIGGER on_payment_insert
AFTER INSERT ON public.booking_payments
FOR EACH ROW EXECUTE FUNCTION public.update_booking_payment_status();
