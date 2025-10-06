import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { supabase, Listing } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '../components/UI/Button';
import { User, Mail, Phone, MessageSquare, AlertCircle, CheckCircle, Hash, ArrowLeft, Calendar, Users as GuestsIcon, DollarSign, Wallet, Building } from 'lucide-react';
import { LoadingPage } from '../components/UI/LoadingSpinner';

const bookingSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(['pay_on_arrival', 'lipa_mdogo_mdogo', 'mpesa']),
  mpesa_code: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod === 'mpesa') {
    return data.mpesa_code && data.mpesa_code.length >= 10;
  }
  return true;
}, {
  message: 'A valid M-Pesa transaction code is required for this payment method.',
  path: ['mpesa_code'],
});


type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { convert } = useCurrency();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, control } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      paymentMethod: 'pay_on_arrival',
    },
  });

  const watchedPaymentMethod = useWatch({ control, name: 'paymentMethod' });

  useEffect(() => {
    if (location.state) {
      setListing(location.state.listing);
      setBookingDetails(location.state.bookingDetails);
    } else {
      const listingId = location.pathname.split('/').pop();
      if (listingId) {
        navigate(`/listing/${listingId}`);
      } else {
        navigate('/');
      }
    }
  }, [location, navigate]);

  if (!listing || !bookingDetails) {
    return <LoadingPage message="Loading booking details..." />;
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      setError('You must be logged in to book.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let bookingData: any = {
        user_id: user.id,
        listing_id: listing.id,
        check_in_date: new Date(bookingDetails.checkIn).toISOString().split('T')[0],
        check_out_date: bookingDetails.checkOut ? new Date(bookingDetails.checkOut).toISOString().split('T')[0] : null,
        amount: bookingDetails.totalPrice,
        payment_method: data.paymentMethod,
        traveler_details: {
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          special_requests: data.specialRequests,
        },
      };

      if (data.paymentMethod === 'mpesa') {
        bookingData.payment_status = 'pending_confirmation';
        bookingData.status = 'pending_confirmation';
        bookingData.mpesa_code = data.mpesa_code;
      } else if (data.paymentMethod === 'lipa_mdogo_mdogo') {
        bookingData.payment_status = 'pending';
        bookingData.status = 'pending_confirmation';
      } else { // pay_on_arrival
        bookingData.payment_status = 'pending';
        bookingData.status = 'active';
      }

      const { error: insertError } = await supabase.from('bookings').insert(bookingData);
      if (insertError) throw insertError;

      setSuccess('Booking request sent! You will be redirected to your dashboard.');
      setTimeout(() => {
        navigate('/dashboard/my-bookings');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { value: 'pay_on_arrival', title: 'Pay on Arrival', description: 'Reserve now and pay in person when you arrive.', icon: Building },
    { value: 'lipa_mdogo_mdogo', title: 'Lipa Mdogo Mdogo', description: 'Pay in installments. Manage payments from your dashboard.', icon: Wallet },
    { value: 'mpesa', title: 'M-Pesa (Pay in Full)', description: 'Pay the full amount now using M-Pesa.', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={`/listing/${listing.id}`} className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Listing
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Confirm and Pay</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">You're just a few steps away from booking your adventure.</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {success && (
                  <div className="flex items-center p-3 text-green-700 bg-green-50 dark:bg-green-900/50 dark:text-green-300 rounded-lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center p-3 text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-300 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Your Information</h3>
                <InputField id="fullName" label="Full Name" icon={User} register={register} error={errors.fullName} />
                <InputField id="email" label="Email Address" type="email" icon={Mail} register={register} error={errors.email} />
                <InputField id="phone" label="Phone Number" type="tel" icon={Phone} register={register} error={errors.phone} />
                <TextareaField id="specialRequests" label="Special Requests (optional)" icon={MessageSquare} register={register} error={errors.specialRequests} />
                
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 pt-4">Payment Method</h3>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {paymentOptions.map(option => {
                        const isSelected = field.value === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'bg-red-50 dark:bg-red-900/30 border-red-500 ring-2 ring-red-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            <input
                              type="radio"
                              {...field}
                              value={option.value}
                              className="hidden"
                            />
                            <div className="flex items-center mb-2">
                              <option.icon className={`w-5 h-5 mr-2 ${isSelected ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`} />
                              <h4 className="font-bold text-gray-800 dark:text-white">{option.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />

                {(watchedPaymentMethod === 'mpesa' || watchedPaymentMethod === 'lipa_mdogo_mdogo') && (
                  <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-4">
                    <h4 className="font-bold text-green-800 dark:text-green-300">M-Pesa Payment Instructions</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {watchedPaymentMethod === 'mpesa' 
                        ? 'Please send the total amount to our Till Number, then enter the transaction code below to confirm.'
                        : 'To complete your booking, please make your first installment payment to our Till Number. You can add the payment details from your dashboard.'
                      }
                    </p>
                    <p className="text-center font-bold text-lg bg-white dark:bg-gray-700 py-2 rounded-md text-gray-800 dark:text-white">Till Number: 60800</p>
                    {watchedPaymentMethod === 'mpesa' && (
                      <InputField id="mpesa_code" label="M-Pesa Transaction Code" icon={Hash} register={register} error={errors.mpesa_code} placeholder="e.g., RKI4..."/>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <Button type="submit" size="lg" loading={loading}>Confirm & Book Now</Button>
                </div>
              </form>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <img src={listing.images[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/dc2626/white?text=Ziarazetu`} alt={listing.title} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{listing.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{listing.location}</p>
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-2 text-sm">
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
              <div className="flex justify-between items-center font-bold text-lg pt-4 text-gray-900 dark:text-white">
                <span>Total Price</span>
                <span className="flex items-center">{convert(bookingDetails.totalPrice)}</span>
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
