/*
# [Operation] Add Demo Images to Listings
This script updates the existing demo listings with high-quality placeholder images from Unsplash. This will make the application's UI look more complete and visually appealing.

## Query Description:
This operation updates the 'images' column for the six existing demo listings. It is a data-only change and does not alter the database structure. It is safe to run as it only affects demo data and does not delete any information.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (can be reversed by clearing the 'images' column)

## Structure Details:
- Table: public.listings
- Column: images (text[])

## Security Implications:
- RLS Status: Enabled (on public.listings)
- Policy Changes: No
- Auth Requirements: None for this script, but RLS policies apply to the table.

## Performance Impact:
- Indexes: No change
- Triggers: No change
- Estimated Impact: Negligible. Affects only a few rows.
*/

-- Update 'Serengeti Wildlife Safari' with relevant tour images
UPDATE public.listings
SET images = ARRAY[
  'https://images.unsplash.com/photo-1585193911034-e45a9b0a1a5b?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?q=80&w=2070&auto=format&fit=crop'
]
WHERE title = 'Serengeti Wildlife Safari';

-- Update 'Ngorongoro Crater Expedition' with relevant tour images
UPDATE public.listings
SET images = ARRAY[
  'https://images.unsplash.com/photo-1525352622288-4a1715a7116e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534401819199-74a674381353?q=80&w=1932&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1609369964552-412e2034b764?q=80&w=1974&auto=format&fit=crop'
]
WHERE title = 'Ngorongoro Crater Expedition';

-- Update 'Zanzibar Beach Getaway' with relevant stay/beach images
UPDATE public.listings
SET images = ARRAY[
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1610016333203-36554b764653?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574042345330-23b93995a959?q=80&w=1964&auto=format&fit=crop'
]
WHERE title = 'Zanzibar Beach Getaway';

-- Update 'Luxury Maasai Mara Lodge' with relevant stay/lodge images
UPDATE public.listings
SET images = ARRAY[
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2070&auto=format&fit=crop'
]
WHERE title = 'Luxury Maasai Mara Lodge';

-- Update 'Kilimanjaro Charity Climb' with relevant volunteer/adventure images
UPDATE public.listings
SET images = ARRAY[
  'https://images.unsplash.com/photo-1589553500346-a5709a154a49?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop'
]
WHERE title = 'Kilimanjaro Charity Climb';

-- Update 'Coastal Community Project' with relevant volunteer/community images
UPDATE public.listings
SET images = ARRAY[
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?q=80&w=2070&auto=format&fit=crop'
]
WHERE title = 'Coastal Community Project';
