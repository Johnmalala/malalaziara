import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, Listing } from '../lib/supabase';
import { LoadingPage } from '../components/UI/LoadingSpinner';
import ImageGallery from '../components/listing/ImageGallery';
import ListingHeader from '../components/listing/ListingHeader';
import BookingWidget from '../components/listing/BookingWidget';
import ListingTabs from '../components/listing/ListingTabs';
import SimilarListings from '../components/listing/SimilarListings';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('No listing ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listing data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return <LoadingPage message="Loading your adventure..." />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mt-2">{error || 'We could not find the listing you were looking for.'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ListingHeader listing={listing} />
        <ImageGallery images={listing.images} title={listing.title} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <ListingTabs listing={listing} />
          </div>
          <div className="mt-8 lg:mt-0">
            <BookingWidget listing={listing} />
          </div>
        </div>

        <SimilarListings currentListing={listing} />
      </div>
    </motion.div>
  );
};

export default ListingDetail;
