/*
          # [Operation Name]
          Recreate Bookings Table with Correct Schema

          ## Query Description: "This operation will drop the existing 'bookings' table and recreate it with a corrected structure. This is necessary to resolve persistent schema errors and add support for date ranges. All existing booking data will be lost. This change is critical for the booking functionality to work correctly. A backup is strongly recommended before proceeding."
          
          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Drops the existing 'bookings' table.
          - Re-creates the 'booking_status' enum with all required values.
          - Re-creates the 'bookings' table with 'check_in_date', 'check_out_date', and 'status' columns.
          - Enables Row Level Security and adds policies for user access.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Users must be authenticated to create or view their bookings.
          
          ## Performance Impact:
          - Indexes: Standard primary key and foreign key indexes will be created.
          - Triggers: None
          - Estimated Impact: Low, as the table is being recreated.
          */

-- Drop the existing table if it exists to ensure a clean slate.
-- WARNING: This will delete all existing data in the bookings table.
DROP TABLE IF EXISTS public.bookings;

-- Drop the enum if it exists to recreate it with the correct values.
DROP TYPE IF EXISTS public.booking_status;

-- Create the enum type for booking status with all required values.
CREATE TYPE public.booking_status AS ENUM (
    'active',
    'completed',
    'cancelled'
);

-- Recreate the bookings table with the correct schema.
CREATE TABLE public.bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    check_in_date timestamp with time zone NOT NULL,
    check_out_date timestamp with time zone,
    amount numeric NOT NULL,
    payment_status character varying NOT NULL DEFAULT 'pending'::character varying,
    payment_method character varying,
    status booking_status NOT NULL DEFAULT 'active'::booking_status,
    traveler_details jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT bookings_pkey PRIMARY KEY (id),
    CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
    CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies for bookings table
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Grant usage for the new enum type
GRANT USAGE ON TYPE public.booking_status TO authenticated;
