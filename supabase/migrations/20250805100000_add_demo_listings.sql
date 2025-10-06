/*
# [Operation Name]
Seed Demo Listings

[Description of what this operation does]
This script inserts 15 demo listings into the `public.listings` table to provide sample data for the application. It includes 5 listings for each category: 'tour', 'stay', and 'volunteer'.

## Query Description: [This operation will populate the 'listings' table with sample data. It is a non-destructive operation and will not affect any existing data. No backup is required, and the operation is safe to run on a development environment.]

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
[
  "Table: public.listings - Inserting 15 new rows."
]

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [The script assumes RLS is in place. The data is public, so it should be selectable by `anon` and `authenticated` roles.]

## Performance Impact:
- Indexes: [No changes]
- Triggers: [No changes]
- Estimated Impact: [Low. A one-time insert of a small number of rows.]
*/

INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating, itinerary)
VALUES
-- =================================================================
-- TOURS (5 Listings)
-- =================================================================
(
  'Serengeti Great Migration Safari',
  'Witness the breathtaking Great Migration in the Serengeti. This 7-day safari takes you through the heart of Tanzania''s most famous national park, offering unparalleled wildlife viewing opportunities. Stay in comfortable lodges and enjoy expert-guided game drives.',
  'tour',
  2800,
  'Serengeti National Park, Tanzania',
  '{"https://images.unsplash.com/photo-1534445867624-af8870a27395?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1588839249628-36b13a35364e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80"}',
  '{"Airport transfers", "6 nights accommodation", "All meals on safari", "Park fees", "Expert guide"}',
  '{"International flights", "Visa fees", "Tips and gratuities", "Travel insurance"}',
  'active',
  4.9,
  '[
    {"day": 1, "title": "Arrival in Arusha", "description": "Arrive at Kilimanjaro International Airport and transfer to your lodge in Arusha."},
    {"day": 2, "title": "Tarangire National Park", "description": "Game drive in Tarangire, famous for its large elephant herds and baobab trees."},
    {"day": 3, "title": "Journey to Serengeti", "description": "Drive to the vast plains of the Serengeti, with a game drive en route."},
    {"day": 4, "title": "Central Serengeti", "description": "Full day exploring the Seronera Valley, a wildlife hotspot."},
    {"day": 5, "title": "Ngorongoro Crater", "description": "Descend into the Ngorongoro Crater for a spectacular game drive."},
    {"day": 6, "title": "Lake Manyara & Return", "description": "Visit Lake Manyara National Park before returning to Arusha."},
    {"day": 7, "title": "Departure", "description": "Transfer to the airport for your flight home."}
  ]'
),
(
  'Mount Kilimanjaro Machame Route Trek',
  'Conquer the roof of Africa! The Machame route, also known as the "Whiskey" route, is our most popular and successful trek on Kilimanjaro. This 7-day climb offers stunning scenery and excellent acclimatization.',
  'tour',
  2100,
  'Kilimanjaro National Park, Tanzania',
  '{"https://images.unsplash.com/photo-1593315942398-953596599364?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80"}',
  '{"All park fees", "Professional mountain crew", "All meals on the mountain", "High-quality camping equipment", "Emergency oxygen"}',
  '{"Flights", "Sleeping bag", "Tips for the crew", "Personal gear"}',
  'active',
  4.8,
  '[
    {"day": 1, "title": "Machame Gate to Machame Camp", "description": "Begin your trek through the lush rainforest."},
    {"day": 2, "title": "Machame Camp to Shira 2 Camp", "description": "Hike into the moorland zone with views of Kibo Peak."},
    {"day": 3, "title": "Shira 2 Camp to Barranco Camp", "description": "Acclimatization day, crossing the Lava Tower."},
    {"day": 4, "title": "Barranco Camp to Karanga Camp", "description": "Conquer the Barranco Wall and traverse the alpine desert."},
    {"day": 5, "title": "Karanga Camp to Barafu Camp", "description": "Short but steep hike to the base camp."},
    {"day": 6, "title": "Summit Day & Descent", "description": "Midnight start for the summit, then descend to Mweka Camp."},
    {"day": 7, "title": "Mweka Camp to Mweka Gate", "description": "Final descent and transfer back to your hotel."}
  ]'
),
(
  'Maasai Mara Game Drive Adventure',
  'A classic 3-day Kenyan safari in the world-renowned Maasai Mara National Reserve. Experience incredible wildlife concentrations and the rich culture of the Maasai people. Ideal for a short but immersive safari.',
  'tour',
  750,
  'Maasai Mara, Kenya',
  '{"https://images.unsplash.com/photo-1589784325799-97c419de5a59?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1531338833077-9b1519998083?auto=format&fit=crop&w=1200&q=80"}',
  '{"Transport from Nairobi", "2 nights in a safari lodge", "All meals", "Game drives", "Park entry fees"}',
  '{"Drinks", "Maasai village visit (optional)", "Tips"}',
  'active',
  4.7,
  null
),
(
  'Gorilla Trekking in Bwindi',
  'A once-in-a-lifetime experience trekking to see the majestic mountain gorillas in their natural habitat. This 4-day tour takes you deep into Uganda''s Bwindi Impenetrable Forest for an unforgettable encounter.',
  'tour',
  1800,
  'Bwindi Impenetrable Forest, Uganda',
  '{"https://images.unsplash.com/photo-1593836334533-30283f68994a?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1603036034504-a1f735b49767?auto=format&fit=crop&w=1200&q=80"}',
  '{"Gorilla trekking permit", "Accommodation", "Transport in 4x4 vehicle", "English-speaking guide", "Meals"}',
  '{"Flights to Uganda", "Visa", "Personal expenses"}',
  'active',
  5.0,
  null
),
(
  'Zanzibar Spice Tour & Stone Town Discovery',
  'Explore the history and culture of Zanzibar. This full-day tour includes a guided walk through the historic alleyways of Stone Town, a UNESCO World Heritage site, followed by a sensory journey through a local spice farm.',
  'tour',
  120,
  'Zanzibar, Tanzania',
  '{"https://images.unsplash.com/photo-1605537932043-1a030a783777?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1583793079255-413c64bf3856?auto=format&fit=crop&w=1200&q=80"}',
  '{"Hotel pickup and drop-off", "Professional guide", "Spice farm entrance fee", "Fruit tasting", "Lunch"}',
  '{"Drinks", "Souvenirs"}',
  'active',
  4.6,
  null
),

-- =================================================================
-- STAYS (5 Listings)
-- =================================================================
(
  'Luxury Beach Villa in Diani',
  'Escape to your private paradise. This stunning 3-bedroom villa on Diani Beach offers a private pool, direct beach access, and a personal chef. Perfect for families or groups seeking ultimate relaxation and luxury.',
  'stay',
  450,
  'Diani Beach, Kenya',
  '{"https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"}',
  '{"Private pool", "Wi-Fi", "Air conditioning", "Daily housekeeping", "Personal chef"}',
  '{"Groceries", "Airport transfers"}',
  'active',
  4.9,
  null
),
(
  'Eco-Lodge with Kilimanjaro Views',
  'Stay in a sustainable eco-lodge at the foot of Mount Kilimanjaro. Enjoy breathtaking views, organic farm-to-table meals, and guided nature walks. A truly serene and environmentally-conscious retreat.',
  'stay',
  180,
  'Amboseli, Kenya',
  '{"https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-16158807532Criminals?auto=format&fit=crop&w=1200&q=80"}',
  '{"En-suite rooms", "Solar power", "Organic meals", "Guided walks"}',
  '{"Park fees", "Game drives"}',
  'active',
  4.8,
  null
),
(
  'Chic Apartment in Westlands, Nairobi',
  'A modern and stylish one-bedroom apartment in the vibrant Westlands neighborhood of Nairobi. Features a rooftop pool, gym, and stunning city views. Perfect for business travelers or couples exploring the city.',
  'stay',
  95,
  'Nairobi, Kenya',
  '{"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"}',
  '{"Rooftop pool", "Gym", "High-speed Wi-Fi", "24/7 security", "Fully equipped kitchen"}',
  '{"Meals", "Laundry service"}',
  'active',
  4.7,
  null
),
(
  'Boutique Riad in Stone Town',
  'Experience the magic of Zanzibar in this beautifully restored riad in the heart of Stone Town. Authentic Swahili architecture meets modern comfort. Enjoy the rooftop terrace with ocean views and a tranquil courtyard pool.',
  'stay',
  150,
  'Stone Town, Zanzibar',
  '{"https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1590490359855-359a5fb7055a?auto=format&fit=crop&w=1200&q=80"}',
  '{"Breakfast included", "Courtyard pool", "Rooftop terrace", "Air conditioning", "Wi-Fi"}',
  '{"Lunch and Dinner", "Tours and activities"}',
  'active',
  4.9,
  null
),
(
  'Glamping Tent in Tsavo',
  'Experience the wild in comfort. Our spacious glamping tents in Tsavo East offer king-sized beds, en-suite bathrooms, and private verandas overlooking a waterhole. An intimate and authentic safari experience.',
  'stay',
  250,
  'Tsavo East National Park, Kenya',
  '{"https://images.unsplash.com/photo-1598623277663-065495d4381d?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80"}',
  '{"En-suite bathroom", "Private veranda", "All meals", "Guided bush walks"}',
  '{"Park fees", "Game drives", "Drinks"}',
  'active',
  4.8,
  null
),

-- =================================================================
-- VOLUNTEER (5 Listings)
-- =================================================================
(
  'Community Teaching Project in Arusha',
  'Make a lasting impact by teaching English, math, and sports to children in a local school near Arusha. This program is perfect for those passionate about education and cultural exchange. Minimum 2-week commitment.',
  'volunteer',
  450,
  'Arusha, Tanzania',
  '{"https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"}',
  '{"Accommodation with a host family", "3 meals per day", "Project coordination", "Airport pickup"}',
  '{"Flights", "Visa", "Weekend excursions"}',
  'active',
  4.9,
  null
),
(
  'Wildlife Conservation in Laikipia',
  'Join a dedicated team working to protect Kenya''s iconic wildlife. Activities include tracking animals, removing snares, community outreach, and habitat restoration. A hands-on conservation experience.',
  'volunteer',
  800,
  'Laikipia, Kenya',
  '{"https://images.unsplash.com/photo-1614027164847-1b28accfb4cc?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1604940500612-740b33535496?auto=format&fit=crop&w=1200&q=80"}',
  '{"Shared accommodation in a research camp", "All meals", "Project equipment", "Training"}',
  '{"Flights", "Personal insurance"}',
  'active',
  4.8,
  null
),
(
  'Marine Biology Research on Wasini Island',
  'Contribute to vital marine conservation efforts off the coast of Kenya. Work alongside marine biologists on coral reef surveys, turtle monitoring, and community education programs. PADI certification is a plus but not required.',
  'volunteer',
  650,
  'Wasini Island, Kenya',
  '{"https://images.unsplash.com/photo-155198724អ្វីគ្រប់យ៉ាង?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=1200&q=80"}',
  '{"Basic shared accommodation", "Meals", "Dive equipment for research", "Scientific training"}',
  '{"Flights", "Dive certification courses", "Visa"}',
  'active',
  4.7,
  null
),
(
  'Healthcare Support in Rural Uganda',
  'Assist local medical staff in a rural community clinic. This program is open to medical students and professionals. Tasks may include health education campaigns, basic patient care, and administrative support.',
  'volunteer',
  550,
  'Jinja, Uganda',
  '{"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1530491448693-ES4355598854?auto=format&fit=crop&w=1200&q=80"}',
  '{"Accommodation", "Meals", "In-country support", "Project placement"}',
  '{"Flights", "Medical registration (if required)", "Scrubs/Uniform"}',
  'active',
  4.9,
  null
),
(
  'Women''s Empowerment Initiative',
  'Work with a local NGO to support women''s empowerment through skill-building workshops, business training, and education. Help women in the community achieve economic independence and a brighter future.',
  'volunteer',
  400,
  'Mombasa, Kenya',
  '{"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1200&q=80"}',
  '{"Host family accommodation", "Breakfast and dinner", "Project guidance"}',
  '{"Flights", "Lunches", "Personal spending money"}',
  'active',
  4.8,
  null
);
