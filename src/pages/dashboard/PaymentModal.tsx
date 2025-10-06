import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, Booking } from '../../lib/supabase';
import Modal from '../../components/admin/Modal';
import { Button } from '../../components/UI/Button';
import { DollarSign, Hash, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  mpesa_code: z.string().min(10, 'A valid M-Pesa code is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { convert } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const remainingBalance = booking.amount - (booking.total_paid || 0);

  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance > 0 ? remainingBalance : 0,
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (data.amount > remainingBalance) {
      setError(`Payment cannot exceed the remaining balance of ${convert(remainingBalance)}.`);
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('booking_payments').insert({
        booking_id: booking.id,
        amount: data.amount,
        mpesa_code: data.mpesa_code,
        payment_date: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setSuccess('Payment submitted successfully! Your booking will be updated shortly.');
      onPaymentSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to submit payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Make a Payment for Booking #${booking.id.substring(0,8)}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <div className="flex items-center p-3 text-green-700 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center p-3 text-red-700 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-bold">Payment Summary</h4>
          <p><strong>Total Cost:</strong> {convert(booking.amount)}</p>
          <p><strong>Amount Paid:</strong> {convert(booking.total_paid || 0)}</p>
          <p className="font-bold text-red-600"><strong>Remaining Balance:</strong> {convert(remainingBalance)}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
            <h4 className="font-bold text-green-800">M-Pesa Payment Instructions</h4>
            <p className="text-sm text-green-700">Please send your payment to our Till Number, then enter the amount and transaction code below.</p>
            <p className="text-center font-bold text-lg bg-white py-2 rounded-md">Till Number: 60800</p>
        </div>

        <InputField id="amount" label="Amount to Pay (USD)" type="number" icon={DollarSign} register={register} error={errors.amount} />
        <InputField id="mpesa_code" label="M-Pesa Transaction Code" icon={Hash} register={register} error={errors.mpesa_code} placeholder="e.g., RKI4..." />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Payment</Button>
        </div>
      </form>
    </Modal>
  );
};

const InputField = ({ id, label, icon: Icon, register, error, type = 'text', placeholder = '' }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input id={id} type={type} {...register(id)} step="0.01" className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder={placeholder} />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

export default PaymentModal;
