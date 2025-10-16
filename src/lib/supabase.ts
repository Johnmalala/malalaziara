import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: 'experience' | 'stay' | 'volunteer' | 'event';
  sub_category: string;
  price: number;
  location: string;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  status: 'active' | 'inactive';
  partner_id?: string;
  created_at: string;
  updated_at: string;
  rating?: number;
  amenities?: string[];
  impact_areas?: string[];
  itinerary?: ItineraryItem[] | null;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  commission_percentage: number;
  agreement_status: 'active' | 'pending' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  listing_id: string;
  check_in_date: string;
  check_out_date?: string | null;
  amount: number;
  payment_method: 'pay_on_arrival' | 'mpesa';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  traveler_details: {
    full_name: string;
    email: string;
    phone: string;
    special_requests?: string;
  };
  mpesa_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: string;
  booking_id: string;
  amount: number;
  payment_date: string;
  transaction_code?: string | null;
  created_at: string;
}

export interface CustomPackageRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  title: string;
  destination: string;
  interests: string[];
  budget_range: string;
  preferred_dates: string;
  group_size: number;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  banner_url: string;
  banner_title: string;
  banner_subtitle: string;
  featured_listings: string[];
  contact_email: string;
  contact_phone: string;
  address: string;
  signin_image_url: string;
  signup_image_url: string;
  created_at: string;
  updated_at: string;
}
