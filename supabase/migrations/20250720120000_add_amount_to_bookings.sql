/*
  # [Structural] Add amount column to bookings table
  This migration adds a new 'amount' column to the 'bookings' table to store the total cost of each booking.

  ## Query Description:
  - This operation adds a new `amount` column of type `numeric` to the `bookings` table.
  - It sets a `NOT NULL` constraint with a default value of `0` to ensure data integrity for existing rows.
  - A `CHECK` constraint is added to prevent negative values from being inserted.
  - This change is non-destructive and should not impact existing data, as old rows will default to 0.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (The column can be dropped)

  ## Structure Details:
  - Table: public.bookings
  - Column Added: amount (numeric, NOT NULL, DEFAULT 0)
  - Constraint Added: bookings_amount_check (CHECK (amount >= 0))

  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: None

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Low. The operation might take a moment on very large tables but is generally fast.
*/

ALTER TABLE public.bookings
ADD COLUMN amount numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.bookings.amount IS 'The total cost of the booking.';

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_amount_check CHECK (amount >= 0);
