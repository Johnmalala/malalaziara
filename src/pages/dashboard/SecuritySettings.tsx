import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/UI/Button';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const SecuritySettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;
      
      setSuccess('Your password has been updated successfully!');
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Manage your account password.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm max-w-2xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Change Password</h3>
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
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className={`w-full pl-10 pr-3 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={`w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
