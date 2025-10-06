import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import { supabase, Listing, SiteSettings } from '../../lib/supabase';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import ListingCard from '../../components/listing/ListingCard';

const Home: React.FC = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      setSiteSettings(settings);

      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      setFeaturedListings(listings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates for site_settings
    const channel = supabase.channel('site-settings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          // Re-fetch data when a change is detected
          fetchData();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (loading && !siteSettings) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  const categories = [
    { title: 'Wildlife Experiences', description: 'Experience the Big Five', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&h=400', link: '/experiences' },
    { title: 'Luxury Stays', description: 'Premium accommodations', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&h=400', link: '/stays' },
    { title: 'Volunteer Programs', description: 'Make a difference', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&h=400', link: '/volunteers' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url(${siteSettings?.banner_url || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1920&h=1080'})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-bold mb-6">
            {siteSettings?.banner_title || 'Discover East Africa'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-xl md:text-2xl mb-8 text-gray-200">
            {siteSettings?.banner_subtitle || 'Premium experiences, luxury stays, and meaningful volunteer opportunities.'}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/experiences"><Button size="lg">Explore Experiences</Button></Link>
            <Link to="/custom-package"><Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900 dark:hover:text-gray-900">Custom Package</Button></Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Explore East Africa</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">From the savannas of Kenya to the mountains of Tanzania, discover unique experiences.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div key={category.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="group cursor-pointer">
                <Link to={category.link}>
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={category.image} alt={category.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                      <p className="text-gray-200 mb-4">{category.description}</p>
                      <div className="flex items-center space-x-2"><span className="text-sm">Explore</span><ArrowRight className="w-4 h-4" /></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Experiences</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Hand-picked adventures for unforgettable memories</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
