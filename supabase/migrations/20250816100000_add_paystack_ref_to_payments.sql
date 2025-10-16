/*
          # [Structural] Add Paystack Reference to Payments
          [This migration adds a 'paystack_reference' column to the 'booking_payments' table to store the unique transaction identifier from Paystack for installment payments.]

          ## Query Description: [This is a non-destructive operation that adds a new, nullable column to the 'booking_payments' table. It will not affect existing data. This is necessary to reconcile payments made via Paystack.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: booking_payments
          - Column Added: paystack_reference (TEXT)
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible.
          */
ALTER TABLE public.booking_payments
ADD COLUMN paystack_reference TEXT;
