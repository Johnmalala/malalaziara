/*
# [FEATURE] Add Status to Bookings Table
This migration adds a `status` column to the `bookings` table to track the state of each booking (e.g., active, completed, cancelled).

## Query Description:
This operation adds a new `status` column to the `bookings` table. It first defines a new data type `booking_status` with allowed values ('active', 'cancelled', 'completed'). The new column will have a default value of 'active', so existing and new bookings will be set to 'active' unless specified otherwise. This change is non-destructive to existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (with manual steps)

## Structure Details:
- **Tables Modified**: `public.bookings`
- **Columns Added**: `status` (type: `booking_status`, `NOT NULL`, `DEFAULT 'active'`)
- **Types Created**: `public.booking_status` (ENUM)

## Security Implications:
- RLS Status: Unchanged. Existing RLS policies on the `bookings` table will continue to apply.
- Policy Changes: No.
- Auth Requirements: No direct changes to authentication.

## Performance Impact:
- Indexes: None added. The impact on write performance is negligible. Query performance for filtering by status will be efficient.
- Triggers: None added.
- Estimated Impact: Low. The operation should be fast on tables of small to medium size.
*/

-- Step 1: Create the custom ENUM type for booking status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('active', 'cancelled', 'completed');
    END IF;
END$$;

-- Step 2: Add the 'status' column to the 'bookings' table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS status public.booking_status NOT NULL DEFAULT 'active';
