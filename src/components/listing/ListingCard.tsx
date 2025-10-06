import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import { Listing } from '../../lib/supabase';
import { Button } from '../UI/Button';
import WishlistButton from './WishlistButton';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ListingCardProps {
  listing: Listing;
  index: number;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, index }) => {
  const { convert } = useCurrency();
  const categoryStyles = {
    experience: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    stay: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    volunteer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    event: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <div className="relative h-48 overflow-hidden">
        <Link to={`/listing/${listing.id}`}>
          <img 
            src={listing.images[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/dc2626/white?text=Ziarazetu`}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-3 right-3">
          <WishlistButton listingId={listing.id} />
        </div>
        {listing.sub_category && (
          <div className="absolute bottom-3 left-3 px-2 py-1 text-xs font-semibold rounded-full bg-black/50 text-white capitalize">
            {listing.sub_category.replace('-', ' ')}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryStyles[listing.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'} capitalize`}>
            {listing.category}
          </span>
          {listing.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1 dark:text-gray-300">{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{listing.title}</h3>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{listing.location}</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{listing.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {convert(listing.price)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
              {listing.category === 'stay' ? '/ night' : '/ person'}
            </span>
          </div>
          <Link to={`/listing/${listing.id}`}>
            <Button size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
