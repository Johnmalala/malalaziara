import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Button } from '../UI/Button';
import { Smartphone, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

const mpesaSchema = z.object({
  phone: z.string().min(10, 'A valid phone number is required (e.g., 2547... or 07...)'),
});
type MpesaForm = z.infer<typeof mpesaSchema>;

interface PaymentFormsProps {
  bookingId: string;
  amount: number;
  currency: string;
  email: string;
}

const PaymentForms: React.FC<PaymentFormsProps> = ({ bookingId, amount, currency, email }) => {
  const [activeTab, setActiveTab] = useState<'mpesa' | 'card'>('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<MpesaForm>({
    resolver: zodResolver(mpesaSchema),
  });

  const handleMpesaSubmit = async (data: MpesaForm) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('initiate-daraja-payment', {
        body: {
          booking_id: bookingId,
          phone_number: data.phone,
          amount: Math.ceil(amount), // Daraja requires an integer
        },
      });

      if (invokeError) throw invokeError;
      if (responseData.error) throw new Error(responseData.error);

      setSuccess('STK push sent! Please check your phone to complete the payment.');

    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('mpesa')}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'mpesa' ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          <Smartphone size={18} /> Pay with M-Pesa
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'card' ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          <CreditCard size={18} /> Pay with Card
        </button>
      </div>
      <div className="pt-6">
        {success && (
          <div className="flex items-center p-3 mb-4 text-green-700 bg-green-50 dark:bg-green-900/50 dark:text-green-300 rounded-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center p-3 mb-4 text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-300 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {activeTab === 'mpesa' && (
          <form onSubmit={handleSubmit(handleMpesaSubmit)} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">M-Pesa Phone Number</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="e.g., 254712345678"
                className={`mt-1 w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Pay {currency} {Math.ceil(amount)} with M-Pesa
            </Button>
          </form>
        )}
        {activeTab === 'card' && (
          <div className="space-y-4 text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
             <p className="text-sm text-gray-600 dark:text-gray-300">
               Card payments are coming soon.
             </p>
             <Button disabled className="w-full">
               Card Payment (Coming Soon)
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaymentForms;
