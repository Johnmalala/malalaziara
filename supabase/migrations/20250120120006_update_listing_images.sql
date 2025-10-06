/*
# [Data] Update Listing Image URLs
This migration updates the image URLs for existing demo listings to use a more reliable image service (picsum.photos). This should resolve issues where images were not displaying correctly.

## Query Description: This operation will modify the 'images' column for 12 specific listings. It is a safe data update and does not affect table structure. No data will be lost, only replaced.

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Modifies column 'images' in table 'public.listings'

## Security Implications:
- RLS Status: Enabled
- Policy Changes: [No]
- Auth Requirements: [Admin privileges to run migration]

## Performance Impact:
- Indexes: [Not affected]
- Triggers: [Not affected]
- Estimated Impact: [Low, affects a small number of rows]
*/

-- Update Tour Images
UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/serengeti/800/600']
WHERE title = 'Serengeti Wildlife Safari';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/zanzibar/800/600']
WHERE title = 'Zanzibar Beach Getaway';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/kilimanjaro/800/600']
WHERE title = 'Kilimanjaro Mountain Trek';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/maasai/800/600']
WHERE title = 'Maasai Mara Migration Tour';

-- Update Stay Images
UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/ngorongoro/800/600']
WHERE title = 'Luxury Lodge in Ngorongoro';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/stonetown/800/600']
WHERE title = 'Boutique Hotel in Stone Town';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/pemba/800/600']
WHERE title = 'Eco-Lodge on Pemba Island';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/diani/800/600']
WHERE title = 'Beachfront Villa in Diani';

-- Update Volunteer Images
UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/arusha/800/600']
WHERE title = 'Teach English in Arusha';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/tsavo/800/600']
WHERE title = 'Wildlife Conservation in Tsavo';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/kampala/800/600']
WHERE title = 'Community Health Project in Kampala';

UPDATE public.listings
SET images = ARRAY['https://picsum.photos/seed/marine/800/600']
WHERE title = 'Marine Conservation in Zanzibar';
