/*
# [Operation Name: Seed Demo Listings (Corrected)]
This script seeds the database with a variety of demo listings for tours, stays, and volunteer opportunities. This version corrects previous errors by removing all non-existent columns from the INSERT statements.

## Query Description: [This operation inserts new rows into the 'listings' table. It is a non-destructive data addition and is safe to run on development or staging environments. It will not affect any existing data.]

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Tables affected: public.listings
- Columns inserted into: title, description, category, price, location, images, inclusions, exclusions, status, rating

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [service_role key required to run migration]

## Performance Impact:
- Indexes: [No changes]
- Triggers: [No changes]
- Estimated Impact: [Low. Inserts a small number of rows.]
*/

-- Seed data for 'tour' category
INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating) VALUES
('Serengeti Great Migration Safari', 'Witness the breathtaking Great Migration in this 7-day luxury safari across the Serengeti plains. Stay in exclusive tented camps and see the Big Five.', 'tour', 3500, 'Serengeti, Tanzania', 
'{"https://images.unsplash.com/photo-1534445867742-43195f4f686c?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1588836203342-179a6a81b4a3?auto=format&fit=crop&w=800&q=60"}', 
'{"Accommodation", "All meals", "Park fees", "4x4 Safari vehicle", "Professional guide"}', 
'{"International flights", "Visa fees", "Tips", "Personal items"}', 'active', 4.9),

('Kilimanjaro Machame Route Trek', 'Conquer the roof of Africa! This 8-day trek on the popular Machame route offers stunning scenery and a challenging adventure.', 'tour', 2200, 'Kilimanjaro, Tanzania', 
'{"https://images.unsplash.com/photo-1593318343178-6c51a3a33c89?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=60"}', 
'{"Mountain guide & porters", "All meals on trek", "Camping equipment", "Park fees"}', 
'{"Hiking gear rental", "Tips", "Hotel before/after trek"}', 'active', 4.8),

('Mombasa City & Old Town Tour', 'Explore the historic port city of Mombasa. Visit Fort Jesus, wander through the narrow streets of Old Town, and experience the vibrant local markets.', 'tour', 150, 'Mombasa, Kenya', 
'{"https://images.unsplash.com/photo-1596714227031-73733553537e?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1603201124412-46135252efe3?auto=format&fit=crop&w=800&q=60"}', 
'{"Transport", "Entry to Fort Jesus", "Local guide", "Lunch"}', 
'{"Souvenirs", "Drinks"}', 'active', 4.7);

-- Seed data for 'stay' category
INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating) VALUES
('Zanzibar Beachfront Bungalow', 'Escape to a private bungalow on the white sandy beaches of Nungwi. Perfect for a romantic getaway or a peaceful retreat.', 'stay', 250, 'Zanzibar, Tanzania', 
'{"https://images.unsplash.com/photo-1610044502952-cf8c0a772134?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1602002418816-5c0aeef4205d?auto=format&fit=crop&w=800&q=60"}', 
'{"Private beach access", "Breakfast included", "King-size bed", "Air conditioning", "Wi-Fi"}', 
'{"Airport transfers", "Excursions"}', 'active', 4.9),

('Nairobi Boutique Hotel', 'A stylish and modern hotel in the heart of Nairobi. Close to major attractions like the Giraffe Centre and David Sheldrick Wildlife Trust.', 'stay', 180, 'Nairobi, Kenya', 
'{"https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=60"}', 
'{"Rooftop pool", "Gym access", "Buffet breakfast", "High-speed Wi-Fi"}', 
'{"Spa services", "City tours"}', 'active', 4.7),

('Eco-Lodge near Amboseli', 'Stay in a sustainable eco-lodge with stunning views of Mount Kilimanjaro. Powered by solar and committed to conservation.', 'stay', 320, 'Amboseli, Kenya', 
'{"https://images.unsplash.com/photo-1604335243869-987825a0a86d?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1580494767360-14545b35c053?auto=format&fit=crop&w=800&q=60"}', 
'{"Guided nature walks", "All meals (farm-to-table)", "Stargazing sessions"}', 
'{"Game drives", "Alcoholic beverages"}', 'active', 4.8);

-- Seed data for 'volunteer' category
INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating) VALUES
('Community Teaching in Arusha', 'Volunteer at a local primary school in Arusha. Assist with teaching English, math, and sports. A rewarding cultural exchange.', 'volunteer', 4, 'Arusha, Tanzania', 
'{"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=60"}', 
'{"Accommodation with a host family", "3 meals per day", "Project orientation", "24/7 in-country support", "Education"}', 
'{"Flights", "Visa", "Personal expenses"}', 'active', 4.9),

('Marine Conservation in Watamu', 'Join a team dedicated to protecting the coral reefs and marine life of Watamu Marine National Park. Activities include reef monitoring and beach clean-ups.', 'volunteer', 2, 'Watamu, Kenya', 
'{"https://images.unsplash.com/photo-1582298533423-3e8915b51a52?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1551893004-96507b4861a4?auto=format&fit=crop&w=800&q=60"}', 
'{"Shared volunteer house", "Scuba diving certification (PADI)", "Project equipment", "Meals on weekdays", "Environment"}', 
'{"Weekend meals", "Flights", "Personal travel"}', 'active', 4.8),

('Women''s Empowerment Project', 'Work with local women''s groups in a rural Kenyan village. Assist with skill-building workshops, micro-finance initiatives, and health education.', 'volunteer', 8, 'Rural Kenya', 
'{"https://images.unsplash.com/photo-1618214394999-0044675cc533?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1527525443425-5a4f3b79f532?auto=format&fit=crop&w=800&q=60"}', 
'{"Accommodation", "All meals", "Project coordination", "Community Development"}', 
'{"Flights", "Visa", "Transport to project"}', 'active', 4.9);
