import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion } from 'framer-motion';
import { Minus, Plus, Users, Calendar as CalendarIcon } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import { Listing } from '../../lib/supabase';
import { Button } from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BookingWidgetProps {
  listing: Listing;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ listing }) => {
  const { user } = useAuth();
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState<Date | [Date, Date] | null>(new Date());
  const [guests, setGuests] = useState(1);

  const isStay = listing.category === 'stay';

  const handleDateChange = (value: any) => {
    setDate(value);
  };

  const incrementGuests = () => setGuests(prev => prev + 1);
  const decrementGuests = () => setGuests(prev => (prev > 1 ? prev - 1 : 1));

  const getBookingDetails = () => {
    let checkIn: Date, checkOut: Date | null, nights: number, totalPrice: number;

    if (isStay && Array.isArray(date) && date.length === 2) {
      checkIn = date[0];
      checkOut = date[1];
      nights = differenceInCalendarDays(checkOut, checkIn);
      totalPrice = listing.price * guests * (nights > 0 ? nights : 1);
    } else {
      checkIn = Array.isArray(date) ? date[0] : (date as Date);
      checkOut = null;
      nights = 0;
      totalPrice = listing.price * guests;
    }

    return { checkIn, checkOut, nights, totalPrice, guests };
  };

  const handleBookNowClick = () => {
    if (!user) {
      navigate('/signin', { state: { from: location } });
    } else if (date) {
      navigate(`/book/${listing.id}`, {
        state: {
          listing: listing,
          bookingDetails: getBookingDetails(),
        },
      });
    }
  };

  const { nights, totalPrice } = getBookingDetails();

  return (
    <motion.div 
      className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{convert(listing.price)}</span>
        <span className="text-gray-600 dark:text-gray-400 ml-2">/ {isStay ? 'night' : 'person'}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <CalendarIcon size={18} />
            {isStay ? 'Select check-in & check-out dates' : 'Select your date'}
          </label>
          <Calendar
            onChange={handleDateChange}
            value={date}
            selectRange={isStay}
            minDate={new Date()}
            className="mt-2 border-none"
            tileClassName="rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">Guests</label>
          <div className="flex items-center justify-between mt-2 border border-gray-300 dark:border-gray-600 rounded-lg p-2">
            <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex items-center gap-4">
              <button onClick={decrementGuests} className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg text-gray-900 dark:text-white">{guests}</span>
              <button onClick={incrementGuests} className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t dark:border-gray-700 pt-4">
        {isStay && nights > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{convert(listing.price)} x {nights} nights</span>
            <span>{convert(listing.price * nights)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{convert(totalPrice)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full mt-4" onClick={handleBookNowClick} disabled={!date}>
        Book Now
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        You won't be charged yet
      </p>
    </motion.div>
  );
};

export default BookingWidget;
