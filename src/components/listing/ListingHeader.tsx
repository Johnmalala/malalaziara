import React, { useState } from 'react';
import { MapPin, Star, Share2 } from 'lucide-react';
import { Listing } from '../../lib/supabase';
import { Button } from '../UI/Button';
import WishlistButton from './WishlistButton';
import ShareModal from './ShareModal';

interface ListingHeaderProps {
  listing: Listing;
}

const ListingHeader: React.FC<ListingHeaderProps> = ({ listing }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const rating = listing.rating || 4.8;
  const reviewCount = Math.floor(Math.random() * 100) + 15;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = listing.title;
    const shareText = `Check out this amazing experience in East Africa: ${listing.title}. Perfect for your next adventure!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error: any) {
        // NotAllowedError is thrown when the user cancels the share dialog or permission is denied.
        // We can treat this as a signal to fall back to the modal without logging an error.
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          console.error('Unexpected error using Web Share API:', error);
        }
        // Always fallback to the modal if sharing fails or is cancelled.
        setIsShareModalOpen(true);
      }
    } else {
      // Fallback for desktop or browsers that don't support Web Share API
      setIsShareModalOpen(true);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{listing.title}</h1>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{rating.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-5 h-5" />
              <span>{listing.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={Share2} onClick={handleShare}>Share</Button>
            <WishlistButton listingId={listing.id} />
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={listing.title}
      />
    </>
  );
};

export default ListingHeader;
