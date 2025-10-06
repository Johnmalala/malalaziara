import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/UI/Button';
import { User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfileSettings: React.FC = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name, phone: data.phone })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setSuccess('Your profile has been updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Manage your personal information.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm max-w-2xl border border-gray-200 dark:border-gray-700">
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

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="full_name"
                type="text"
                {...register('full_name')}
                className={`w-full pl-10 pr-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full pl-10 pr-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
