import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { supabase, Listing } from '../../lib/supabase';
import SkeletonCard from '../../components/UI/SkeletonCard';
import ListingCard from '../../components/listing/ListingCard';
import { Button } from '../../components/UI/Button';

const subCategories = ['all', 'safari', 'event', 'single-day-tour', 'multi-day-tour', 'cultural'];

const Experiences: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [priceRange, setPriceRange] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchTerm, sortBy, priceRange, activeSubCategory]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'experience')
        .eq('status', 'active');

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    if (activeSubCategory !== 'all') {
      filtered = filtered.filter(listing => listing.sub_category === activeSubCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'budget':
          filtered = filtered.filter(listing => listing.price < 100);
          break;
        case 'mid':
          filtered = filtered.filter(listing => listing.price >= 100 && listing.price < 500);
          break;
        case 'luxury':
          filtered = filtered.filter(listing => listing.price >= 500);
          break;
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredListings(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Experiences & Safaris
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Discover East Africa's incredible wildlife, landscapes, and cultural heritage through our expertly guided experiences.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="title">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget (&lt; $100)</option>
              <option value="mid">Mid-range ($100 - $500)</option>
              <option value="luxury">Luxury ($500+)</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {subCategories.map(sub => (
              <Button
                key={sub}
                variant={activeSubCategory === sub ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveSubCategory(sub)}
                className="capitalize"
              >
                {sub.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Fetching experiences...' : `Showing ${filteredListings.length} of ${listings.length} experiences`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No experiences found matching your criteria.</p>
            <Button onClick={() => {
              setSearchTerm('');
              setPriceRange('all');
              setSortBy('title');
              setActiveSubCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Experiences;
