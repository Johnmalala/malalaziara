import React, { useEffect, useState, useCallback } from 'react';
import { supabase, BookingPayment } from '../../lib/supabase';
import Modal from './Modal';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { DollarSign, Hash, Calendar } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ isOpen, onClose, bookingId }) => {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isOpen) {
      fetchPayments();
    }
  }, [isOpen, fetchPayments]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payment History for Booking #${bookingId.substring(0, 8)}`}>
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No payments have been recorded for this booking yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-lg text-gray-800">${payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                <Hash className="w-4 h-4" />
                <span>M-Pesa Code: {payment.mpesa_code}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default PaymentHistoryModal;
