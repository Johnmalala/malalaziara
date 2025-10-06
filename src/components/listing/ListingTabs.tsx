import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faker } from '@faker-js/faker';
import { Check, X, ChevronDown, ChevronUp, Clock, Users, ShieldCheck, Utensils, Star } from 'lucide-react';
import { Listing, ItineraryItem } from '../../lib/supabase';

interface ListingTabsProps {
  listing: Listing;
}

const TABS = ['Overview', 'Itinerary', 'Inclusions', 'Reviews'];

const ListingTabs: React.FC<ListingTabsProps> = ({ listing }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  const availableTabs = TABS.filter(tab => {
    if (tab === 'Itinerary' && (listing.category !== 'experience' || !listing.itinerary || listing.itinerary.length === 0)) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Overview' && <OverviewTab listing={listing} />}
            {activeTab === 'Itinerary' && <ItineraryTab listing={listing} />}
            {activeTab === 'Inclusions' && <InclusionsTab listing={listing} />}
            {activeTab === 'Reviews' && <ReviewsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ listing: Listing }> = ({ listing }) => {
    const highlights = [
        { icon: Clock, text: '7-day experience' },
        { icon: Users, text: 'Small group (max 12)' },
        { icon: ShieldCheck, text: 'Certified Guide' },
        { icon: Utensils, text: 'Meals included' },
    ];
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">About this experience</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
            {listing.category === 'experience' && (
              <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Highlights</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {highlights.map(item => (
                          <div key={item.text} className="flex items-center gap-3">
                              <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 p-2 rounded-lg">
                                  <item.icon className="w-5 h-5" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                          </div>
                      ))}
                  </div>
              </div>
            )}
        </div>
    );
};

const ItineraryTab: React.FC<{ listing: Listing }> = ({ listing }) => {
    const [openDay, setOpenDay] = useState<number | null>(1);
    const itinerary = listing.itinerary || [];

    if (listing.category !== 'experience' || itinerary.length === 0) {
        return <p className="text-gray-600 dark:text-gray-400">No detailed itinerary available for this listing.</p>;
    }

    return (
        <div className="space-y-4">
            {itinerary.sort((a, b) => a.day - b.day).map((item: ItineraryItem) => (
                <div key={item.day} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button onClick={() => setOpenDay(openDay === item.day ? null : item.day)} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Day {item.day}: {item.title}</span>
                        {openDay === item.day ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <AnimatePresence>
                        {openDay === item.day && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-white dark:bg-gray-800"
                            >
                                <p className="p-4 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const InclusionsTab: React.FC<{ listing: Listing }> = ({ listing }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">What's Included</h3>
            <ul className="space-y-3">
                {(listing.inclusions || []).map((item, index) => (
                    <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">What's Not Included</h3>
            <ul className="space-y-3">
                {(listing.exclusions || []).map((item, index) => (
                    <li key={index} className="flex items-start">
                        <X className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const ReviewsTab: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const generateReviews = () => {
      const reviewData = [];
      for (let i = 0; i < 5; i++) {
        reviewData.push({
          id: faker.string.uuid(),
          author: faker.person.fullName(),
          avatar: faker.image.avatar(),
          date: faker.date.past({ years: 1 }).toLocaleDateString(),
          rating: faker.number.int({ min: 4, max: 5 }),
          text: faker.lorem.paragraph(),
        });
      }
      setReviews(reviewData);
    };
    generateReviews();
  }, []);

  return (
    <div className="space-y-8">
      {reviews.map(review => (
        <div key={review.id} className="flex items-start space-x-4">
          <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{review.author}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{review.date}</p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{review.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingTabs;
