import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Booking, Listing } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import PaymentModal from './PaymentModal';

type BookingWithListing = Booking & {
  listings: Pick<Listing, 'id' | 'title' | 'images' | 'location'>;
};

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const { convert } = useCurrency();
  const [bookings, setBookings] = useState<BookingWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithListing | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*, listings(id, title, images, location)')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data as BookingWithListing[]);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase.channel('realtime-my-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user?.id}` }, fetchBookings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_payments' }, fetchBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings, user]);

  const handleOpenPaymentModal = (booking: BookingWithListing) => {
    setSelectedBooking(booking);
    setIsPaymentModalOpen(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    const { error: updateError } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    if (updateError) setError('Failed to cancel the booking. Please contact support.');
  };

  const formatDateRange = (checkIn: string, checkOut: string | null | undefined) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const checkInDate = new Date(checkIn).toLocaleDateString(undefined, options);
    if (!checkOut) return checkInDate;
    const checkOutDate = new Date(checkOut).toLocaleDateString(undefined, options);
    return checkInDate === checkOutDate ? checkInDate : `${checkInDate} - ${checkOutDate}`;
  };

  const getStatusBadge = (booking: BookingWithListing) => {
    if (booking.status === 'cancelled') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Cancelled</span>;
    if (booking.status === 'completed') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Completed</span>;
    if (booking.payment_status === 'confirmed') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Confirmed</span>;
    if (booking.payment_status === 'partially_paid') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Partially Paid</span>;
    if (booking.status === 'pending_confirmation') return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</span>;
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{booking.status}</span>;
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-center py-10 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg"><h3 className="font-bold">An Error Occurred</h3><p>{error}</p></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Track your upcoming and past adventures with Ziarazetu.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-4">No Bookings Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't booked any trips yet. Your next adventure awaits!</p>
          <Link to="/experiences" className="mt-6 inline-block"><Button>Explore Experiences</Button></Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const amountPaid = booking.total_paid || 0;
            const remainingBalance = booking.amount - amountPaid;
            const percentagePaid = booking.amount > 0 ? (amountPaid / booking.amount) * 100 : 0;

            return (
              <div key={booking.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:space-x-6">
                <Link to={`/listing/${booking.listing_id}`} className="w-full md:w-1/3 flex-shrink-0">
                  <img src={booking.listings.images[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/dc2626/white?text=Ziarazetu`} alt={booking.listings.title} className="w-full h-48 md:h-full object-cover rounded-lg" />
                </Link>
                <div className="flex-1 w-full mt-4 md:mt-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{booking.listings.title}</h3>
                    {getStatusBadge(booking)}
                  </div>
                  
                  <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <InfoItem icon={MapPin} text={booking.listings.location} />
                    <InfoItem icon={Calendar} text={formatDateRange(booking.check_in_date, booking.check_out_date)} />
                    <InfoItem icon={DollarSign} text={`Total: ${convert(booking.amount)}`} />
                  </div>

                  {booking.payment_method === 'lipa_mdogo_mdogo' && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Progress</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${percentagePaid}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Paid: {convert(amountPaid)}</span>
                        <span>Remaining: {convert(remainingBalance)}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                    <Link to={`/listing/${booking.listing_id}`}><Button variant="outline" size="sm">View Details</Button></Link>
                    {booking.payment_method === 'lipa_mdogo_mdogo' && remainingBalance > 0 && (
                      <Button size="sm" icon={CreditCard} onClick={() => handleOpenPaymentModal(booking)}>Make Payment</Button>
                    )}
                    {booking.status === 'active' && <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50" onClick={() => handleCancelBooking(booking.id)}>Cancel</Button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedBooking && (
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          booking={selectedBooking}
          onPaymentSuccess={fetchBookings}
        />
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <div className="flex items-center">
    <Icon className="w-4 h-4 mr-2 text-gray-400" />
    <span>{text}</span>
  </div>
);

export default MyBookings;
