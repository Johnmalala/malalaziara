import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Listing } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '../../components/UI/Button';

type WishlistItem = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listings: Listing;
};

const MyWishlist: React.FC = () => {
  const { user } = useAuth();
  const { convert } = useCurrency();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, listings(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlist(data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (wishlistItemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId);
      
      if (error) throw error;
      
      fetchWishlist();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your saved adventures and dream destinations.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Heart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-4">Your Wishlist is Empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Start exploring and save your favorite trips by clicking the heart icon.</p>
          <Link to="/experiences" className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
            Explore Experiences
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(({ id, listings: listing }) => (
            <div key={id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group border border-gray-200 dark:border-gray-700">
              <div className="relative h-48">
                <img 
                  src={listing.images[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/dc2626/white?text=Ziarazetu`}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => handleRemove(id)}
                  className="absolute top-3 right-3 bg-white dark:bg-gray-700 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{listing.title}</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">{convert(listing.price)}</span>
                  <Link to={`/listing/${listing.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWishlist;
