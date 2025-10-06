/*
          # Operation: Insert Demo Products
          This script inserts a variety of sample listings into the `listings` table to populate the Tours, Stays, and Volunteer pages with realistic demo content.

          ## Query Description: 
          - This operation adds new rows to the `listings` table.
          - It is a non-destructive action and will not affect any of your existing data.
          - No backup is required, but it's always good practice.
          
          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (can be deleted manually)
          
          ## Structure Details:
          - Table: `public.listings`
          - Action: INSERT
          
          ## Security Implications:
          - RLS Status: Not affected.
          - Policy Changes: No.
          - Auth Requirements: None.
          
          ## Performance Impact:
          - Indexes: Not affected.
          - Triggers: Not affected.
          - Estimated Impact: Negligible.
          */

INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating, amenities, impact_areas) VALUES
-- Tours
('Serengeti & Ngorongoro Safari', 'An unforgettable 7-day journey through the heart of Tanzania''s most famous national parks. Witness the Great Migration and the stunning Ngorongoro Crater.', 'tour', 2500, 'Tanzania', '{"https://images.unsplash.com/photo-1534408642263-4919a0a29c88?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1589983293826-2183350994cd?auto=format&fit=crop&w=800&q=60"}', '{"Airport transfers", "Park fees", "4x4 Safari Vehicle", "Professional Guide", "Full board accommodation"}', '{"International flights", "Visa fees", "Tips"}', 'active', 4.9, NULL, NULL),
('Mount Kilimanjaro Climb (Machame Route)', 'Challenge yourself with a 7-day trek to the roof of Africa via the scenic Machame route. Experience breathtaking views and diverse ecosystems.', 'tour', 1800, 'Tanzania', '{"https://images.unsplash.com/photo-1589553400936-7efe33068638?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1609192189138-1a5ce53351cb?auto=format&fit=crop&w=800&q=60"}', '{"Professional mountain guides", "All meals on the mountain", "Camping equipment", "Park fees"}', '{"Hiking gear rental", "Tips for the crew", "Personal expenses"}', 'active', 4.8, NULL, NULL),
('Zanzibar Spice & Stone Town Tour', 'A 3-day cultural immersion in Zanzibar. Explore the historic Stone Town, a UNESCO World Heritage site, and visit a local spice farm.', 'tour', 450, 'Zanzibar, Tanzania', '{"https://images.unsplash.com/photo-1605712437679-4634044573e6?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1599927698822-7013c714555e?auto=format&fit=crop&w=800&q=60"}', '{"Guided tours", "Accommodation in Stone Town", "Spice farm entrance fee", "Breakfast"}', '{"Lunches and dinners", "Flights to Zanzibar", "Personal shopping"}', 'active', 4.7, NULL, NULL),

-- Stays
('Luxury Safari Lodge in Serengeti', 'Stay in a luxurious tented lodge with stunning views of the Serengeti plains. Enjoy gourmet meals and a private plunge pool.', 'stay', 750, 'Serengeti, Tanzania', '{"https://images.unsplash.com/photo-1528909819323-0b98a5a44391?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=60"}', '{"All-inclusive meals", "Infinity pool", "Guided nature walks", "Wi-Fi"}', '{"Game drives", "Spa treatments"}', 'active', 4.9, '{"Wi-Fi", "Pool", "Restaurant"}', NULL),
('Beachfront Bungalow in Nungwi', 'A rustic and charming bungalow right on the white sandy beaches of Nungwi, Zanzibar. Perfect for a romantic getaway.', 'stay', 120, 'Nungwi, Zanzibar', '{"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fitcrop&w=800&q=60"}', '{"Private beach access", "Air conditioning", "Breakfast included"}', '{"Airport transfer", "Excursions"}', 'active', 4.6, '{"Wi-Fi", "Beachfront", "Air Conditioning"}', NULL),
('Eco-Lodge in the Usambara Mountains', 'An off-the-grid eco-lodge offering tranquility and stunning mountain views. A perfect base for hiking and bird watching.', 'stay', 85, 'Lushoto, Tanzania', '{"https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=60"}', '{"Farm-to-table meals", "Guided hikes", "Solar power"}', '{"Transportation to the lodge", "Specialty drinks"}', 'active', 4.8, '{"Restaurant", "Hiking Trails"}', NULL),

-- Volunteers
('Community Teaching in Arusha', 'Volunteer as a teaching assistant in a local primary school in Arusha. Help with English, math, and sports education.', 'volunteer', 4, 'Arusha, Tanzania', '{"https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=60"}', '{"Accommodation with a host family", "3 meals per day", "Project orientation"}', '{"Flights", "Visa", "Personal expenses"}', 'active', NULL, NULL, '{"Education", "Community Development"}'),
('Marine Conservation in Zanzibar', 'Join a team dedicated to protecting Zanzibar''s coral reefs and marine life. Activities include reef monitoring, beach clean-ups, and community outreach.', 'volunteer', 8, 'Zanzibar, Tanzania', '{"https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=60"}', '{"Shared volunteer house", "Scuba diving certification (PADI)", "All project equipment"}', '{"Food", "Personal travel"}', 'active', NULL, NULL, '{"Environment", "Marine Conservation"}'),
('Women''s Empowerment Project', 'Work with local women''s groups on skill development, financial literacy, and small business creation.', 'volunteer', 2, 'Moshi, Tanzania', '{"https://images.unsplash.com/photo-161616156 атмосфера/photo-1616161560000-000000000000?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1527525443983-6e60c7535228?auto=format&fit=crop&w=800&q=60"}', '{"Homestay accommodation", "Project supervision", "Cultural workshops"}', '{"Flights", "Daily transport", "Weekend trips"}', 'active', NULL, NULL, '{"Community Development", "Empowerment"}');
