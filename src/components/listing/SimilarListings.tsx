import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, Listing } from '../../lib/supabase';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { MapPin, Star } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface SimilarListingsProps {
  currentListing: Listing;
}

const SimilarListings: React.FC<SimilarListingsProps> = ({ currentListing }) => {
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { convert } = useCurrency();

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('category', currentListing.category)
          .neq('id', currentListing.id)
          .limit(3);

        if (error) throw error;
        setSimilar(data || []);
      } catch (err) {
        console.error('Error fetching similar listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentListing.id, currentListing.category]);

  if (loading) {
    return <div className="py-8"><LoadingSpinner /></div>;
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">You might also like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {similar.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <Link to={`/listing/${listing.id}`}>
              <img
                src={listing.images[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/dc2626/white?text=${encodeURIComponent('Ziarazetu')}`}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{listing.title}</h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">{convert(listing.price)}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{listing.rating?.toFixed(1) || '4.7'}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SimilarListings;
