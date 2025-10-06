/*
          # [Operation Name]
          Safe Update for Bookings Table

          ## Query Description: "This operation safely modifies the 'bookings' table to support date ranges for stays. It replaces the old 'booking_date' column with 'check_in_date' and 'check_out_date'. The script is designed to be non-destructive; it will attempt to preserve existing data by migrating it from the old column to the new one before making structural changes. This is a safe operation, but backing up your 'bookings' table is always a good practice before running schema changes."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Modifies Table: public.bookings
          - Adds Columns: check_in_date, check_out_date, status
          - Removes Column: booking_date
          - Adds Type: booking_status
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: Admin privileges
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Low. The operation will be fast on tables with a moderate number of rows.
          */
-- This script safely modifies the bookings table to support date ranges.
-- It replaces 'booking_date' with 'check_in_date' and 'check_out_date'.

-- Step 1: Add the new columns if they don't exist.
-- We add them as nullable first to avoid issues with existing rows.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='check_in_date') THEN
        ALTER TABLE public.bookings ADD COLUMN check_in_date date;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='check_out_date') THEN
        ALTER TABLE public.bookings ADD COLUMN check_out_date date;
    END IF;
END $$;

-- Step 2: Copy data from old column to new column if the old column exists.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_date') THEN
        UPDATE public.bookings SET check_in_date = booking_date WHERE check_in_date IS NULL;
    END IF;
END $$;

-- Step 3: Make check_in_date NOT NULL now that it's populated.
ALTER TABLE public.bookings ALTER COLUMN check_in_date SET NOT NULL;

-- Step 4: Drop the old booking_date column if it exists.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_date') THEN
        ALTER TABLE public.bookings DROP COLUMN booking_date;
    END IF;
END $$;

-- Step 5: Ensure the status column and its type exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('active', 'completed', 'cancelled');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='status') THEN
        ALTER TABLE public.bookings ADD COLUMN status public.booking_status NOT NULL DEFAULT 'active';
    END IF;
END $$;
