import React from 'react';
import { Booking } from '../../lib/supabase';
import Modal from '../../components/admin/Modal';
import { useCurrency } from '../../contexts/CurrencyContext';
import PaymentForms from '../../components/shared/PaymentForms';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { convert: formatCurrency, currency, rates } = useCurrency();

  const remainingBalance = booking.amount - (booking.total_paid || 0);
  const remainingBalanceInTargetCurrency = remainingBalance * (rates[currency] || 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Make a Payment for Booking #${booking.id.substring(0,8)}`}>
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
          <h4 className="font-bold dark:text-white">Payment Summary</h4>
          <div className="text-sm space-y-1 mt-2">
            <div className="flex justify-between"><span>Total Cost:</span> <span className="font-medium">{formatCurrency(booking.amount)}</span></div>
            <div className="flex justify-between"><span>Amount Paid:</span> <span className="font-medium">{formatCurrency(booking.total_paid || 0)}</span></div>
            <div className="flex justify-between text-base font-bold text-red-600 dark:text-red-400"><span>Remaining Balance:</span> <span>{formatCurrency(remainingBalance)}</span></div>
          </div>
        </div>
        
        <PaymentForms
          bookingId={booking.id}
          amount={remainingBalanceInTargetCurrency}
          currency={currency}
          email={booking.traveler_details.email}
        />
      </div>
    </Modal>
  );
};

export default PaymentModal;
