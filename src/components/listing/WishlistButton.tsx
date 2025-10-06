import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

interface WishlistButtonProps {
  listingId: string;
  size?: 'sm' | 'md';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ listingId, size = 'md' }) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkWishlistStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsWishlisted(true);
        setWishlistItemId(data.id);
      } else {
        setIsWishlisted(false);
        setWishlistItemId(null);
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    } finally {
      setLoading(false);
    }
  }, [user, listingId]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Maybe prompt to sign in
      return;
    }
    
    setLoading(true);

    if (isWishlisted && wishlistItemId) {
      // Remove from wishlist
      const { error } = await supabase.from('wishlist').delete().eq('id', wishlistItemId);
      if (!error) {
        setIsWishlisted(false);
        setWishlistItemId(null);
      }
    } else {
      // Add to wishlist
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, listing_id: listingId })
        .select('id')
        .single();
      
      if (!error && data) {
        setIsWishlisted(true);
        setWishlistItemId(data.id);
      }
    }
    setLoading(false);
  };
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white dark:hover:bg-gray-700 transition-colors ${sizeClasses[size]}`}
      aria-label="Save to wishlist"
    >
      <Heart className={`${iconSizeClasses[size]} ${isWishlisted ? 'fill-current' : ''}`} />
    </motion.button>
  );
};

export default WishlistButton;
