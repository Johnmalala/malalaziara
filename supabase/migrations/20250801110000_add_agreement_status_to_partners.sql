/*
# [Feature] Add Agreement Status to Partners
This migration adds a new column 'agreement_status' to the 'partners' table to track the status of partner agreements.

## Query Description:
This operation is structural and safe. It creates a new ENUM type for partner statuses and then adds a non-nullable column to the `partners` table with a default value of 'pending'. No existing data will be lost or modified.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Adds ENUM type: `public.partner_agreement_status`
- Modifies table: `public.partners`
  - Adds column: `agreement_status` (type: `partner_agreement_status`, NOT NULL, DEFAULT: 'pending')

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Adding a column with a default value may require a brief table lock on very large tables, but this is expected to be fast.
*/

-- Create the ENUM type for partner agreement status if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_agreement_status') THEN
        CREATE TYPE public.partner_agreement_status AS ENUM ('active', 'pending', 'expired');
    END IF;
END$$;

-- Add the new column to the partners table if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'partners'
        AND column_name = 'agreement_status'
    ) THEN
        ALTER TABLE public.partners
        ADD COLUMN agreement_status public.partner_agreement_status NOT NULL DEFAULT 'pending';
    END IF;
END$$;
