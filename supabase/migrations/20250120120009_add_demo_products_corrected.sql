/*
          # [Data] Add Demo Products (Corrected)
          This script inserts sample data into the `listings` table for tours, stays, and volunteer opportunities. This corrected version removes the non-existent 'amenities' column from the insert statements to prevent errors.

          ## Query Description: [This operation inserts new rows into the `listings` table. It is safe to run and will not affect any existing data. It simply populates the website with sample content for demonstration purposes.]
          
          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables affected: `public.listings`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: "Negligible performance impact. Inserts a small number of rows."
          */

-- Demo Tours
INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating, impact_areas) VALUES
('Serengeti & Ngorongoro Safari', 'A 7-day classic safari exploring the vast plains of the Serengeti and the unique ecosystem of the Ngorongoro Crater. Witness the Big Five and the Great Migration.', 'tour', 2800, 'Tanzania', '{"https://images.unsplash.com/photo-1534408641199-078a8a577cda?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1588836268803-241b3a15093c?auto=format&fit=crop&w=800&q=60"}', '{"Airport transfers", "4x4 Safari vehicle", "Professional guide", "All park fees", "Full board accommodation"}', '{"International flights", "Visa fees", "Tips", "Personal items"}', 'active', 4.9, '{"Wildlife Conservation"}'),
('Kilimanjaro Climb - Machame Route', 'Challenge yourself with a 7-day trek to the roof of Africa via the scenic Machame route. Fully supported climb with experienced guides and porters.', 'tour', 2100, 'Tanzania', '{"https://images.unsplash.com/photo-1589553400762-238ba6627b3e?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=60"}', '{"Experienced guides & porters", "All meals on the mountain", "Camping equipment", "Park fees"}', '{"Hiking gear rental", "Tips", "Flights"}', 'active', 4.8, '{"Community Tourism"}'),
('Maasai Mara Migration Experience', 'A 4-day adventure in Kenya''s famous Maasai Mara to witness the dramatic river crossings of the Great Wildebeest Migration.', 'tour', 1500, 'Kenya', '{"https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1589907489307-332151c67690?auto=format&fit=crop&w=800&q=60"}', '{"Game drives", "Accommodation", "Park fees", "Meals"}', '{"Flights to Nairobi", "Balloon safari (optional)"}', 'active', 4.9, '{"Wildlife Conservation"}');

-- Demo Stays
INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating, impact_areas) VALUES
('Zanzibar Beachfront Villa', 'A luxurious private villa on the pristine white sands of Nungwi Beach, Zanzibar. Perfect for a romantic getaway or family holiday.', 'stay', 350, 'Zanzibar, Tanzania', '{"https://images.unsplash.com/photo-1610016333218-6775de23c324?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60"}', '{"Private pool", "Daily breakfast", "Wi-Fi", "Air conditioning"}', '{"Lunch & Dinner", "Excursions"}', 'active', 4.9, '{"Local Economy"}'),
('Luxury Safari Lodge near Amboseli', 'Stay in a luxury tented lodge with stunning views of Mount Kilimanjaro. Enjoy gourmet meals and close encounters with elephants.', 'stay', 450, 'Amboseli, Kenya', '{"https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60"}', '{"All meals", "Guided walking safaris", "Infinity pool", "Wi-Fi"}', '{"Game drives", "Park fees"}', 'active', 4.8, '{"Eco-tourism"}'),
('Nairobi Boutique Hotel', 'An elegant and serene boutique hotel in the leafy suburbs of Karen, Nairobi. Close to the Giraffe Centre and David Sheldrick Wildlife Trust.', 'stay', 220, 'Nairobi, Kenya', '{"https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1590490359854-dfba59ee83f4?auto=format&fit=crop&w=800&q=60"}', '{"Breakfast", "Airport transfer", "Swimming pool", "Gym"}', '{"Tours", "Other meals"}', 'active', 4.7, '{"Urban Tourism"}');

-- Demo Volunteer Opportunities
INSERT INTO public.listings (title, description, category, price, location, images, inclusions, exclusions, status, rating, impact_areas) VALUES
('Community Teaching in Arusha', 'Volunteer as a teaching assistant in a local primary school in Arusha. Help with English, math, and sports education. A rewarding cultural exchange.', 'volunteer', 4, 'Arusha, Tanzania', '{"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=60"}', '{"Accommodation with a host family", "3 meals per day", "Project orientation", "24/7 in-country support"}', '{"Flights", "Visa", "Personal expenses"}', 'active', 4, '{"Education", "Community Development"}'),
('Wildlife Conservation in Kenya', 'Join a conservation project near Tsavo National Park. Participate in anti-poaching patrols, data collection, and community outreach programs.', 'volunteer', 8, 'Tsavo, Kenya', '{"https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=60"}', '{"Basic shared accommodation", "All meals", "Project training", "Transport to project site"}', '{"Flights", "Park fees on days off"}', 'active', 8, '{"Wildlife Conservation", "Environment"}'),
('Marine Conservation in Zanzibar', 'Work with a local NGO on coral reef restoration and sea turtle protection projects in Zanzibar. Includes scuba diving opportunities for certified divers.', 'volunteer', 6, 'Zanzibar, Tanzania', '{"https://images.unsplash.com/photo-1572095759913-2a4c413994cb?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=60"}', '{"Shared volunteer house", "Meals", "Project equipment", "PADI training for long-term volunteers"}', '{"Flights", "Diving certification (if not certified)"}', 'active', 6, '{"Marine Biology", "Environment"}');
