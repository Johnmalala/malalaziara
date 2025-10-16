/*
          # [Operation Name]
          Simplify Payment Schema for Manual Processing

          ## Query Description: [This migration simplifies the booking and payment system by removing columns and types related to complex API integrations (Daraja, Intasend, etc.) and focusing on manual M-Pesa and Pay on Arrival methods. It alters enums and drops unnecessary columns. This change is not easily reversible and is designed to stabilize the payment flow.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["High"]
          - Requires-Backup: [true]
          - Reversible: [false]
          
          ## Structure Details:
          - Modifies `booking_status` enum
          - Modifies `payment_method` enum
          - Drops `payment_reference` from `bookings` table
          - Drops `daraja_checkout_request_id` from `bookings` table
          - Drops `payment_reference` from `booking_payments` table
          - Adds `mpesa_code` to `bookings` table
          
          ## Security Implications:
          - RLS Status: [No Change]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low. This is a schema cleanup.]
          */

-- Drop old enum types if they exist to recreate them cleanly
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    ALTER TABLE "bookings" ALTER COLUMN "status" TYPE text;
    DROP TYPE "booking_status";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    ALTER TABLE "bookings" ALTER COLUMN "payment_status" TYPE text;
    DROP TYPE "payment_status";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    ALTER TABLE "bookings" ALTER COLUMN "payment_method" TYPE text;
    DROP TYPE "payment_method";
  END IF;
END$$;

-- Create simplified enums
CREATE TYPE "booking_status" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE "payment_method" AS ENUM ('pay_on_arrival', 'mpesa');

-- Alter the bookings table to use the new types and clean up columns
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "mpesa_code" text,
  DROP COLUMN IF EXISTS "payment_reference",
  DROP COLUMN IF EXISTS "daraja_checkout_request_id",
  ALTER COLUMN "status" TYPE booking_status USING status::booking_status,
  ALTER COLUMN "payment_method" TYPE payment_method USING payment_method::payment_method;

-- Clean up the booking_payments table
ALTER TABLE "booking_payments"
  DROP COLUMN IF EXISTS "payment_reference",
  RENAME COLUMN IF EXISTS "daraja_mpesa_receipt" TO "mpesa_code";

-- We no longer need the payment_status column as the booking status is sufficient
ALTER TABLE "bookings"
  DROP COLUMN IF EXISTS "payment_status";
