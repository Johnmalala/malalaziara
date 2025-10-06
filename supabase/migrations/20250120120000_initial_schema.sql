/*
# Ziarazetu Tourism Platform - Initial Database Schema
This migration creates the complete database schema for the Ziarazetu tourism platform including user profiles, listings, bookings, partners, custom package requests, and site settings.

## Query Description: 
This operation creates the foundational database structure for a tourism platform. It establishes user management, listing management, booking system, partner management, and content management capabilities. This is a comprehensive setup that will enable all platform features but requires careful configuration of Row Level Security policies.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- profiles: User profiles linked to auth.users
- listings: Tours, stays, volunteers with full details
- bookings: User booking records with payment tracking
- partners: Business partner management
- custom_package_requests: Special trip requests
- site_settings: Global platform configuration
- listing_availability: Date-based availability calendar

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes - comprehensive RLS policies
- Auth Requirements: Integration with Supabase Auth

## Performance Impact:
- Indexes: Added on foreign keys and search fields
- Triggers: Profile creation trigger
- Estimated Impact: Low - optimised for read/write operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE listing_category AS ENUM ('tour', 'stay', 'volunteer');
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_method AS ENUM ('pay_on_arrival', 'lipa_mdogo_mdogo');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'failed');
CREATE TYPE request_status AS ENUM ('new', 'contacted', 'closed', 'converted');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'partner');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    commission_percentage DECIMAL(5,2) DEFAULT 0.00,
    agreement_start_date DATE,
    agreement_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category listing_category NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    inclusions TEXT[] DEFAULT '{}',
    exclusions TEXT[] DEFAULT '{}',
    status listing_status DEFAULT 'draft' NOT NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    max_capacity INTEGER DEFAULT 1,
    duration_days INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create listing availability table
CREATE TABLE listing_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    max_bookings INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(listing_id, available_date)
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    traveler_name TEXT NOT NULL,
    traveler_email TEXT NOT NULL,
    traveler_phone TEXT NOT NULL,
    number_of_travelers INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    booking_status booking_status DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create custom package requests table
CREATE TABLE custom_package_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    destination TEXT,
    travel_dates_start DATE,
    travel_dates_end DATE,
    number_of_travelers INTEGER DEFAULT 1,
    budget_range TEXT,
    special_requirements TEXT,
    status request_status DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create site settings table
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
('hero_banner_url', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 'Homepage hero banner image URL'),
('site_title', 'Ziarazetu', 'Main site title'),
('site_description', 'Discover amazing tours, stays, and volunteer opportunities in Tanzania', 'Site description for SEO');

-- Create indexes for better performance
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_availability_listing_date ON listing_availability(listing_id, available_date);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Create function to automatically create profile
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER create_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    WHEN (NEW.email_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION create_profile_for_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_package_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Partners policies
CREATE POLICY "Anyone can view active partners" ON partners
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage partners" ON partners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Listing availability policies
CREATE POLICY "Anyone can view availability for active listings" ON listing_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE id = listing_availability.listing_id AND status = 'active'
        )
    );

CREATE POLICY "Admins can manage availability" ON listing_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Custom package requests policies
CREATE POLICY "Users can view their own requests" ON custom_package_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create requests" ON custom_package_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all requests" ON custom_package_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update requests" ON custom_package_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON custom_package_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
