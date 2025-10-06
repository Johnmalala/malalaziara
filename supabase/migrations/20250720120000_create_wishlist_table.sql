/*
  # Create Wishlist Table
  This migration creates the `wishlist` table to allow users to save their favorite listings.

  ## Query Description: 
  - Creates a new table named `wishlist`.
  - Establishes relationships between users and listings.
  - Enables Row Level Security to ensure users can only access their own wishlist.
  - No existing data will be affected.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: `public.wishlist`
  - Columns: `id`, `user_id`, `listing_id`, `created_at`
  - Foreign Keys:
    - `wishlist.user_id` -> `auth.users.id`
    - `wishlist.listing_id` -> `public.listings.id`

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (New policies for SELECT, INSERT, DELETE)
  - Auth Requirements: Users must be authenticated to interact with their wishlist.
*/

-- 1. Create the wishlist table
CREATE TABLE public.wishlist (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT wishlist_pkey PRIMARY KEY (id),
    CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT wishlist_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
    CONSTRAINT wishlist_user_listing_unique UNIQUE (user_id, listing_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Users can view their own wishlist items
CREATE POLICY "Enable read access for own wishlist"
ON public.wishlist
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert items into their own wishlist
CREATE POLICY "Enable insert for own wishlist"
ON public.wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Enable delete for own wishlist"
ON public.wishlist
FOR DELETE
USING (auth.uid() = user_id);
