import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/UI/Button';
import { User, Mail, Phone, Map, Calendar, Users, DollarSign, Send, AlertCircle, CheckCircle } from 'lucide-react';

const packageRequestSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  destination: z.string().min(3, 'Destination is required'),
  travelDates: z.string().min(5, 'Please specify your travel dates'),
  travelers: z.coerce.number().min(1, 'At least one traveler is required'),
  budget: z.string().min(3, 'Please specify a budget'),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  message: z.string().optional(),
});

type PackageRequestForm = z.infer<typeof packageRequestSchema>;

const interestOptions = [
  { id: 'wildlife', label: 'Wildlife & Safari' },
  { id: 'culture', label: 'Cultural Immersion' },
  { id: 'beach', label: 'Beach Relaxation' },
  { id: 'adventure', label: 'Adventure & Hiking' },
  { id: 'volunteer', label: 'Volunteering' },
  { id: 'luxury', label: 'Luxury & Relaxation' },
];

const CustomPackage: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PackageRequestForm>({
    resolver: zodResolver(packageRequestSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      interests: [],
    },
  });

  const onSubmit = async (data: PackageRequestForm) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('custom_package_requests')
        .insert([{
          user_id: user?.id || null,
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          title: `Custom Request: ${data.destination} for ${data.travelers} person(s)`,
          destination: data.destination,
          interests: data.interests,
          budget_range: data.budget,
          preferred_dates: data.travelDates,
          group_size: data.travelers,
          message: data.message,
          status: 'new'
        }]);

      if (insertError) throw insertError;

      setSuccess('Your request has been sent! Our team will get back to you within 24 hours.');
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to send your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-20 md:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1523975859828-0b53a330769a?auto=format&fit=crop&w=1200&h=600)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold">Design Your Dream Trip</h1>
          <p className="mt-4 text-xl text-gray-300">
            Tell us your travel aspirations, and we'll craft a personalized East African adventure just for you.
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {success && (
              <div className="flex items-center p-4 text-green-700 bg-green-50 dark:bg-green-900/50 dark:text-green-300 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-sm">{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center p-4 text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-300 rounded-lg">
                <AlertCircle className="w-5 h-5 mr-3" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Personal Details */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">1. Your Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField id="fullName" label="Full Name" icon={User} register={register} error={errors.fullName} />
                <InputField id="email" label="Email Address" type="email" icon={Mail} register={register} error={errors.email} />
                <InputField id="phone" label="Phone Number" type="tel" icon={Phone} register={register} error={errors.phone} />
              </div>
            </div>

            {/* Trip Details */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">2. Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField id="destination" label="Desired Destination(s)" icon={Map} register={register} error={errors.destination} placeholder="e.g., Serengeti, Zanzibar" />
                <InputField id="travelDates" label="Preferred Travel Dates" icon={Calendar} register={register} error={errors.travelDates} placeholder="e.g., June 2025" />
                <InputField id="travelers" label="Number of Travelers" type="number" icon={Users} register={register} error={errors.travelers} />
                <InputField id="budget" label="Estimated Budget (USD)" icon={DollarSign} register={register} error={errors.budget} placeholder="e.g., $3000 per person" />
              </div>
            </div>

            {/* Interests */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">3. Your Interests</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interestOptions.map(interest => (
                  <label key={interest.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" {...register('interests')} value={interest.label} className="h-4 w-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 bg-transparent dark:bg-gray-700" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{interest.label}</span>
                  </label>
                ))}
              </div>
              {errors.interests && <p className="text-sm text-red-600 mt-2">{errors.interests.message}</p>}
            </div>
            
            {/* Additional Message */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">4. Anything Else?</h3>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tell us more about your ideal trip, any special requirements, or questions you have."
              />
            </div>

            <div className="text-center pt-4">
              <Button type="submit" size="lg" loading={loading} icon={Send}>
                Send My Request
              </Button>
            </div>
          </form>
        </motion.div>
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
      <input
        id={id}
        type={type}
        {...register(id)}
        className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

export default CustomPackage;
