import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import 'react-calendar/dist/Calendar.css';

interface AvailabilityCalendarProps {
  listingId: string | undefined;
  initialUnavailableDates?: string[];
  onDatesChange: (dates: string[]) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ listingId, onDatesChange }) => {
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAvailability = useCallback(async () => {
    if (!listingId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('listing_availability')
      .select('unavailable_date')
      .eq('listing_id', listingId);

    if (error) {
      console.error('Error fetching availability', error);
    } else {
      const dates = new Set(data.map(d => new Date(d.unavailable_date).toDateString()));
      setUnavailableDates(dates);
    }
    setLoading(false);
  }, [listingId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  useEffect(() => {
    onDatesChange(Array.from(unavailableDates));
  }, [unavailableDates, onDatesChange]);

  const handleDateClick = (date: Date) => {
    const dateString = date.toDateString();
    const newUnavailableDates = new Set(unavailableDates);
    if (newUnavailableDates.has(dateString)) {
      newUnavailableDates.delete(dateString);
    } else {
      newUnavailableDates.add(dateString);
    }
    setUnavailableDates(newUnavailableDates);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && unavailableDates.has(date.toDateString())) {
      return 'unavailable-date';
    }
    return null;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Manage Availability</label>
      <p className="text-xs text-gray-500 mb-2">Click on dates to mark them as unavailable.</p>
      {loading ? <LoadingSpinner /> : (
        <div className="availability-calendar-wrapper">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            minDate={new Date()}
          />
        </div>
      )}
      <style>{`
        .unavailable-date {
          background-color: #ef4444 !important;
          color: white !important;
          border-radius: 9999px;
        }
        .react-calendar {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AvailabilityCalendar;
