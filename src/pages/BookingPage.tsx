import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { supabase, Listing, Booking } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '../components/UI/Button';
import { User, Mail, Phone, MessageSquare, AlertCircle, CheckCircle, ArrowLeft, Calendar, Users as GuestsIcon } from 'lucide-react';
import { LoadingPage } from '../components/UI/LoadingSpinner';
import PaymentForms from '../components/shared/PaymentForms';

const bookingSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { currency, rates } = useCurrency();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    },
  });

  useEffect(() => {
    if (location.state?.listing && location.state?.bookingDetails) {
      setListing(location.state.listing);
      setBookingDetails(location.state.bookingDetails);
    } else {
      const listingId = location.pathname.split('/').pop();
      navigate(listingId ? `/listing/${listingId}` : '/');
    }
  }, [location, navigate]);

  const subtotal = bookingDetails?.totalPrice || 0;
  const serviceFee = subtotal * 0.05;
  const totalPriceWithFee = subtotal + serviceFee;
  const totalPriceInTargetCurrency = totalPriceWithFee * (rates[currency] || 1);

  const handleProceedToPayment = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    if (!user || !listing || !bookingDetails) {
      setError('Booking details are incomplete.');
      return;
    }
    
    setLoading(true);
    setError('');

    const formData = getValues();

    const bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'total_paid'> = {
      user_id: user.id,
      listing_id: listing.id,
      check_in_date: new Date(bookingDetails.checkIn).toISOString().split('T')[0],
      check_out_date: bookingDetails.checkOut ? new Date(bookingDetails.checkOut).toISOString().split('T')[0] : null,
      amount: totalPriceWithFee,
      payment_method: 'daraja',
      traveler_details: {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.specialRequests,
      },
      payment_status: 'pending',
      status: 'pending_confirmation',
    };

    try {
      const { data: newBooking, error: insertError } = await supabase.from('bookings').insert(bookingData).select().single();
      if (insertError) throw insertError;
      
      setCreatedBooking(newBooking as Booking);

    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!listing || !bookingDetails) {
    return <LoadingPage message="Loading booking details..." />;
  }
  
  const isStay = listing.category === 'stay';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={`/listing/${listing.id}`} className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Listing
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Confirm Your Details</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">You're just a few steps away from your adventure.</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-6">
                {error && (
                  <div className="flex items-center p-3 text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-300 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {!createdBooking ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Your Information</h3>
                    <InputField id="fullName" label="Full Name" icon={User} register={register} error={errors.fullName} />
                    <InputField id="email" label="Email Address" type="email" icon={Mail} register={register} error={errors.email} />
                    <InputField id="phone" label="Phone Number" type="tel" icon={Phone} register={register} error={errors.phone} />
                    <TextareaField id="specialRequests" label="Special Requests (optional)" icon={MessageSquare} register={register} error={errors.specialRequests} />
                    
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button type="button" size="lg" loading={loading} onClick={handleProceedToPayment} className="w-full">
                        Proceed to Payment
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Complete Your Payment</h3>
                    <PaymentForms 
                      bookingId={createdBooking.id}
                      amount={totalPriceInTargetCurrency}
                      currency={currency}
                      email={createdBooking.traveler_details.email}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <img src={listing.images[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/dc2626/white?text=Ziarazetu`} alt={listing.title} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{listing.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{listing.location}</p>
              <div className="border-t border-gray-200 dark:border-gray-700 py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center"><Calendar className="w-4 h-4 mr-2"/>Date</span>
                  <span className="text-gray-800 dark:text-gray-200">{new Date(bookingDetails.checkIn).toLocaleDateString()}</span>
                </div>
                {bookingDetails.checkOut && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center"><Calendar className="w-4 h-4 mr-2"/>Checkout</span>
                    <span className="text-gray-800 dark:text-gray-200">{new Date(bookingDetails.checkOut).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center"><GuestsIcon className="w-4 h-4 mr-2"/>Guests</span>
                  <span className="text-gray-800 dark:text-gray-200">{bookingDetails.guests}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 py-4 space-y-2 text-sm">
                {isStay && bookingDetails.nights > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{new Intl.NumberFormat().format(listing.price)} x {bookingDetails.nights} nights</span>
                    <span className="text-gray-800 dark:text-gray-200">{new Intl.NumberFormat().format(subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                  <span className="text-gray-800 dark:text-gray-200">{new Intl.NumberFormat().format(serviceFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-lg pt-4 text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="flex items-center">{new Intl.NumberFormat().format(totalPriceWithFee)} {currency}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ id, label, icon: Icon, register, error, type = 'text', placeholder = '' }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input id={id} type={type} {...register(id)} className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder={placeholder} />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const TextareaField = ({ id, label, icon: Icon, register, error }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute top-3 left-3 pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <textarea id={id} {...register(id)} rows={3} className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`} />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

export default BookingPage;
