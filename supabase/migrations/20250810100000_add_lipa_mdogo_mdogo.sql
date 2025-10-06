/*
          # [Feature] Add Lipa Mdogo Mdogo (Installment Payments)
          This migration adds the necessary database structures to support installment payments.

          ## Query Description: This operation is safe and non-destructive.
          - It adds a 'partially_paid' value to the payment_status enum.
          - It creates a new `booking_payments` table to track individual payments.
          - It adds Row Level Security policies to this new table.
          - It creates a function and trigger to automatically update the booking status when a payment is made.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Adds `booking_payments` table.
          - Adds `partially_paid` to `payment_status` enum.
          - Adds `update_booking_status_on_payment` function.
          - Adds `on_new_payment` trigger.
          
          ## Security Implications:
          - RLS Status: Enabled on the new table.
          - Policy Changes: Adds new policies for `booking_payments`.
          - Auth Requirements: Users must be authenticated to make payments.
          
          ## Performance Impact:
          - Indexes: Adds a primary key index on the new table.
          - Triggers: Adds one new trigger on the `booking_payments` table.
          - Estimated Impact: Low. The trigger only fires on new payment insertions.
          */

-- Add 'partially_paid' to the payment_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partially_paid' AND enumtypid = 'public.payment_status'::regtype) THEN
        ALTER TYPE public.payment_status ADD VALUE 'partially_paid';
    END IF;
END
$$;

-- Create booking_payments table to track individual payments
CREATE TABLE IF NOT EXISTS public.booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    payment_method TEXT,
    transaction_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

-- Policies for booking_payments
-- Users can see their own payments
CREATE POLICY "Users can view their own payments"
ON public.booking_payments FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.bookings WHERE id = booking_id));

-- Users can insert payments for their own bookings
CREATE POLICY "Users can insert payments for their own bookings"
ON public.booking_payments FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM public.bookings WHERE id = booking_id));

-- Admins can do anything
CREATE POLICY "Admins have full access on booking_payments"
ON public.booking_payments FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create a function to update booking status based on payments
CREATE OR REPLACE FUNCTION public.update_booking_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    total_paid NUMERIC;
    booking_total NUMERIC;
BEGIN
    -- Calculate the total amount paid for the booking
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM public.booking_payments
    WHERE booking_id = NEW.booking_id;

    -- Get the total amount for the booking
    SELECT amount INTO booking_total
    FROM public.bookings
    WHERE id = NEW.booking_id;

    -- Update the booking status
    IF total_paid >= booking_total THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function after a new payment is inserted
DROP TRIGGER IF EXISTS on_new_payment ON public.booking_payments;
CREATE TRIGGER on_new_payment
AFTER INSERT ON public.booking_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_status_on_payment();
