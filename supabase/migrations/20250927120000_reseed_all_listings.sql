/*
  # [DANGEROUS] FULL LISTING RESET
  This script will completely delete all existing listings and their availability, then re-seed the database with new, structured demo data.

  ## Query Description: [This operation will PERMANENTLY DELETE all data from the `listings` and `listing_availability` tables before inserting new demo content. This is a destructive action intended to reset your product catalog. A backup is strongly recommended if you have any data you wish to preserve.]
  
  ## Metadata:
  - Schema-Category: "Dangerous"
  - Impact-Level: "High"
  - Requires-Backup: true
  - Reversible: false
  
  ## Structure Details:
  - Tables Affected: `public.listings`, `public.listing_availability`
  
  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: Admin privileges
  
  ## Performance Impact:
  - Indexes: Unchanged
  - Triggers: Unchanged
  - Estimated Impact: Brief table lock during delete and insert operations.
*/

-- Step 1: Delete all existing availability and listings
DELETE FROM public.listing_availability;
DELETE FROM public.listings;


/*
  # [DATA] SEED NEW LISTINGS
  This script inserts 15 new demo listings across all categories with the new sub-category structure.

  ## Query Description: [This operation populates the `listings` table with a fresh set of demo data for Experiences, Stays, and Volunteer opportunities. This data is for demonstration purposes and does not affect any other tables.]
  
  ## Metadata:
  - Schema-Category: "Data"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (can be deleted manually)
*/

-- Step 2: Insert new listings with updated categories and sub-categories

-- == EXPERIENCES ==
INSERT INTO public.listings (title, description, category, sub_category, price, location, images, inclusions, exclusions, status, itinerary)
VALUES
(
  '7-Day Serengeti Great Migration Safari',
  'Witness one of nature''s most spectacular events. This 7-day safari takes you through the heart of the Serengeti, tracking the great wildebeest migration across the plains and the Mara River.',
  'experience',
  'multi-day-tour',
  2800,
  'Serengeti National Park, Tanzania',
  ARRAY[
    'https://images.unsplash.com/photo-1534437431453-c9195b4f4623?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589656966895-2f33e7a05492?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1543191879-7313a75a73c8?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Park fees', '4x4 Safari Vehicle', 'Professional Guide', 'All meals on safari', '6 nights accommodation'],
  ARRAY['International flights', 'Visa fees', 'Tips and gratuities', 'Personal items'],
  'active',
  '[
    {"day": 1, "title": "Arrival in Arusha", "description": "Arrive at Kilimanjaro International Airport (JRO) and transfer to your lodge in Arusha to relax and prepare for your adventure."},
    {"day": 2, "title": "Tarangire National Park", "description": "Full day game drive in Tarangire, famous for its large elephant herds, baobab trees, and diverse birdlife."},
    {"day": 3, "title": "To the Serengeti", "description": "Drive to the vast plains of the Serengeti National Park, enjoying a game drive en route to your camp."},
    {"day": 4, "title": "Central Serengeti Exploration", "description": "Explore the Seronera Valley, an area rich in wildlife including lions, leopards, and cheetahs."},
    {"day": 5, "title": "Northern Serengeti & Migration", "description": "Head north to track the massive wildebeest herds, potentially witnessing a dramatic river crossing at the Mara River (seasonal)."},
    {"day": 6, "title": "Ngorongoro Crater", "description": "Descend 600m into the Ngorongoro Crater, a UNESCO World Heritage Site, for a final incredible game drive."},
    {"day": 7, "title": "Departure", "description": "Enjoy a final breakfast before returning to Arusha for your departure flight."}
  ]'::jsonb
),
(
  'Maasai Cultural Day Trip',
  'Spend a day with the Maasai people in a traditional village. Learn about their unique culture, cattle-herding lifestyle, and ancient traditions. Participate in a traditional dance and visit a local school.',
  'experience',
  'cultural',
  120,
  'Maasai Mara, Kenya',
  ARRAY[
    'https://images.unsplash.com/photo-1531325099313-205909782a9a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599429598402-d6b0385989e2?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Village entry fees', 'Local guide', 'Traditional lunch', 'Bottled water', 'Round-trip transport'],
  ARRAY['Tips', 'Personal souvenirs'],
  'active',
  null
),
(
  'Nairobi National Park Safari',
  'Experience a classic African safari just minutes from downtown Nairobi. See lions, giraffes, rhinos, and more with the city skyline as a stunning backdrop. A perfect half-day adventure.',
  'experience',
  'safari',
  150,
  'Nairobi, Kenya',
  ARRAY[
    'https://images.unsplash.com/photo-1550854602-5559c018285e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1601121044315-73531065d33d?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Park entry fees', 'Private safari vehicle', 'Professional driver/guide', 'Hotel pickup and drop-off'],
  ARRAY['Meals', 'Gratuities'],
  'active',
  null
),
(
  'Zanzibar Spice Farm & Stone Town Tour',
  'A sensory journey through Zanzibar''s history. Explore a local spice farm to see, smell, and taste exotic spices, then wander the historic alleys of Stone Town, a UNESCO World Heritage site.',
  'experience',
  'single-day-tour',
  95,
  'Stone Town, Zanzibar',
  ARRAY[
    'https://images.unsplash.com/photo-1615986201152-7684a286aff1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1588544253389-8736d7a354a3?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Guided tours of spice farm and Stone Town', 'Spice tasting and fresh fruit', 'Air-conditioned transport'],
  ARRAY['Lunch', 'Entrance to historical sites like the House of Wonders'],
  'active',
  null
),
(
  'Sauti za Busara Music Festival',
  'Experience one of Africa''s best music festivals. Sauti za Busara in Zanzibar features a vibrant lineup of artists from across the continent in the historic Old Fort of Stone Town.',
  'experience',
  'event',
  350,
  'Stone Town, Zanzibar',
  ARRAY[
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd51725?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['4-Day Festival Pass', 'Welcome reception'],
  ARRAY['Accommodation', 'Flights', 'Meals'],
  'active',
  null
),

-- == STAYS ==
(
  'Serengeti Savannah Lodge',
  'A luxury tented lodge in the heart of the Serengeti, offering panoramic views of the plains. Experience the wild in comfort with en-suite bathrooms, private verandas, and gourmet dining.',
  'stay',
  'lodge',
  450,
  'Serengeti, Tanzania',
  ARRAY[
    'https://images.unsplash.com/photo-1604360350472-3c0a35b49a5f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611044238535-b81c1b3c6a85?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Full board (all meals)', 'En-suite luxury tent', 'Guided walking safaris', 'Evening campfires'],
  ARRAY['Park fees', 'Game drives', 'Drinks'],
  'active',
  null
),
(
  'Nungwi Beachfront Resort',
  'Relax in paradise at our luxury beachfront resort in Nungwi. Enjoy pristine white sands, turquoise waters, and world-class amenities including a spa, infinity pool, and multiple restaurants.',
  'stay',
  'resort',
  250,
  'Nungwi, Zanzibar',
  ARRAY[
    'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582610116399-26c62b924298?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Private beach access', 'Infinity swimming pool', 'Breakfast included', 'High-speed Wi-Fi'],
  ARRAY['Lunch & Dinner', 'Spa treatments', 'Excursions', 'Airport transfers'],
  'active',
  null
),
(
  'The Nairobi Art House Hotel',
  'A boutique hotel in Nairobi''s vibrant Kilimani district, celebrating local art and design. Each room is uniquely decorated by a Kenyan artist, offering a stylish and comfortable city base.',
  'stay',
  'hotel',
  180,
  'Nairobi, Kenya',
  ARRAY[
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490359854-dfba59ee83f8?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Art-filled room', 'Rooftop bar access', 'Gourmet breakfast', 'Gym and wellness center'],
  ARRAY['Airport transfers', 'Laundry service'],
  'active',
  null
),
(
  'Kilimanjaro Eco Campsite',
  'A rustic and eco-friendly campsite at the foot of Mount Kilimanjaro. Perfect for adventurers and climbers looking for a basic, clean, and friendly place to stay before or after their trek.',
  'stay',
  'campsite',
  45,
  'Moshi, Tanzania',
  ARRAY[
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533874643333-8a8482d90322?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Tent pitch space', 'Access to shared kitchen', 'Hot showers', 'Secure equipment storage'],
  ARRAY['Tent and gear rental', 'Meals', 'Mountain climbing permits'],
  'active',
  null
),
(
  'Modern City View Apartment',
  'A stylish, fully-furnished apartment in Dar es Salaam with stunning ocean and city views. Features a full kitchen, workspace, and access to a rooftop pool and gym. Ideal for business or leisure.',
  'stay',
  'apartment',
  110,
  'Dar es Salaam, Tanzania',
  ARRAY[
    'https://images.unsplash.com/photo-1618221195710-dd6b41fa2242?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Entire apartment', 'Fully equipped kitchen', 'Rooftop pool & gym access', 'Weekly cleaning service'],
  ARRAY['Daily meals', 'Electricity (pre-paid)', 'Transport'],
  'active',
  null
),

-- == VOLUNTEER ==
(
  'Wildlife Conservation in Tsavo',
  'Join a dedicated anti-poaching and wildlife research team in the vast Tsavo ecosystem. Assist with patrols, data collection, and community outreach programs to protect elephants and other wildlife.',
  'volunteer',
  'wildlife-conservation',
  600,
  'Tsavo National Park, Kenya',
  ARRAY[
    'https://images.unsplash.com/photo-1614027164847-1b28acfb8fb8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1591828333329-0d2469605a9b?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Accommodation in a research camp', 'All meals', 'Project-related transport', 'Training and supervision'],
  ARRAY['Flights', 'Visa', 'Insurance', 'Park entry fees'],
  'active',
  null
),
(
  'Community Teaching Project',
  'Support local education by assisting teachers in a primary school in a rural Tanzanian village. Help with English, math, and sports classes, and contribute to a brighter future for the children.',
  'volunteer',
  'education',
  450,
  'Arusha, Tanzania',
  ARRAY[
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Accommodation with a host family', '3 meals per day', 'Project orientation and materials', '24/7 in-country support'],
  ARRAY['Flights', 'Visa costs', 'Personal expenses', 'Travel insurance'],
  'active',
  null
),
(
  'Marine Conservation in Watamu',
  'Work with a marine biology team to protect coral reefs and sea turtles on the Kenyan coast. Activities include reef monitoring, beach clean-ups, and community awareness campaigns.',
  'volunteer',
  'environmental',
  750,
  'Watamu, Kenya',
  ARRAY[
    'https://images.unsplash.com/photo-1576683896228-453ab24e3d72?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551287585-f24253f95b5c?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Shared volunteer house accommodation', 'All meals', 'Scuba diving certification (PADI)', 'Research equipment'],
  ARRAY['Flights', 'Visa', 'Personal dive gear'],
  'active',
  null
),
(
  'Women''s Empowerment Initiative',
  'Support a local NGO that provides business training and life skills to women in Mombasa. Help with workshops, marketing their crafts, and providing mentorship to aspiring female entrepreneurs.',
  'volunteer',
  'community-development',
  400,
  'Mombasa, Kenya',
  ARRAY[
    'https://images.unsplash.com/photo-1529390079861-59b2531faf1b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620325867744-72d93813a3ca?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Accommodation with a host family', 'Breakfast and dinner', 'Local project coordinator'],
  ARRAY['Lunch', 'Flights', 'Visa', 'Daily transport to project'],
  'active',
  null
),
(
  'Reforestation Project on Mt. Kilimanjaro',
  'Help restore the native forest on the slopes of Africa''s highest peak. Work in a tree nursery, plant saplings, and educate the local community about the importance of conservation.',
  'volunteer',
  'environmental',
  550,
  'Moshi, Tanzania',
  ARRAY[
    'https://images.unsplash.com/photo-1593433399738-035445242c38?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618471301224-9d21655e4396?auto=format&fit=crop&w=1200&q=80'
  ],
  ARRAY['Shared accommodation in a volunteer house', 'All meals', 'Project equipment and training'],
  ARRAY['Flights', 'Visa', 'Insurance', 'Weekend trips'],
  'active',
  null
);
