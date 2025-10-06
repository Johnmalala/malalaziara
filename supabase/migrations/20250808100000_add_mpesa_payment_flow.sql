/*
    # [FEATURE] Add M-Pesa Payment Flow Schema
    This migration updates the database to support a manual M-Pesa payment and confirmation flow.

    ## Query Description: This operation is safe and non-destructive. It adds new options to existing data types (enums) and adds a new, nullable column to the 'bookings' table. No existing data will be modified or lost.

    ## Metadata:
    - Schema-Category: ["Structural"]
    - Impact-Level: ["Low"]
    - Requires-Backup: false
    - Reversible: true

    ## Structure Details:
    - Adds 'mpesa' to the 'booking_payment_method' enum type.
    - Adds 'pending_confirmation' to the 'booking_payment_status' enum type.
    - Adds a new column 'mpesa_code' (TEXT) to the 'bookings' table.

    ## Security Implications:
    - RLS Status: Unchanged
    - Policy Changes: No
    - Auth Requirements: None

    ## Performance Impact:
    - Indexes: None
    - Triggers: None
    - Estimated Impact: Negligible. Adding a nullable column is a fast metadata change.
    */

    -- Step 1: Add 'mpesa' to the payment method enum.
    -- The previous script failed due to an incorrect type name. This script uses a conventional name which should be correct.
    ALTER TYPE public.booking_payment_method ADD VALUE 'mpesa';

    -- Step 2: Add 'pending_confirmation' to the payment status enum.
    -- This new status will be used for bookings that have been paid via M-Pesa but are awaiting manual admin verification.
    ALTER TYPE public.booking_payment_status ADD VALUE 'pending_confirmation';

    -- Step 3: Add a column to store the M-Pesa transaction code.
    -- This allows users to submit their payment code for verification by an admin.
    ALTER TABLE public.bookings
    ADD COLUMN mpesa_code TEXT;
