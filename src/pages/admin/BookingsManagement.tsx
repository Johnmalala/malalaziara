import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Booking } from '../../lib/supabase';
import DataTable, { Column } from '../../components/admin/DataTable';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Button } from '../../components/UI/Button';
import { CheckCircle, Edit, Trash2, Eye } from 'lucide-react';
import PaymentHistoryModal from '../../components/admin/PaymentHistoryModal';
import { useCurrency } from '../../contexts/CurrencyContext';

type BookingWithListing = Booking & {
  listings: { id: string; title: string } | null;
};

const BookingsManagement: React.FC = () => {
  const { convert } = useCurrency();
  const [bookings, setBookings] = useState<BookingWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          listings ( id, title )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase.channel('realtime-bookings-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchBookings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_payments' }, fetchBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  const handleOpenHistoryModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsHistoryModalOpen(true);
  };

  const handleApprove = async (booking: BookingWithListing) => {
    if (window.confirm(`Are you sure you want to approve this payment? This will mark the booking as active.`)) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'active', payment_status: 'confirmed' })
        .eq('id', booking.id);
      
      if (updateError) alert('Failed to approve booking.');
    }
  };

  const handleDelete = async (booking: BookingWithListing) => {
    if (window.confirm(`Are you sure you want to delete this booking? This will also delete all associated payments.`)) {
      await supabase.from('booking_payments').delete().eq('booking_id', booking.id);
      const { error } = await supabase.from('bookings').delete().eq('id', booking.id);
      if (error) alert('Failed to delete booking.');
    }
  };

  const columns: Column<BookingWithListing>[] = [
    { 
      header: 'Listing', 
      accessor: 'listings.title',
      render: (row) => row.listings?.title || 'N/A' 
    },
    { 
      header: 'Customer', 
      accessor: 'traveler_details.full_name',
      render: (row) => row.traveler_details?.full_name || 'N/A'
    },
    { 
      header: 'Amount', 
      accessor: 'amount', 
      render: (row) => `${convert(row.total_paid || 0)} / ${convert(row.amount)}`
    },
    {
      header: 'Payment Ref',
      accessor: 'payment_reference',
      render: (row) => row.payment_reference ? row.payment_reference.substring(0, 15) + '...' : 'N/A'
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${
          row.status === 'active' || row.payment_status === 'confirmed' ? 'bg-green-100 text-green-800' :
          row.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          row.payment_status === 'partially_paid' ? 'bg-orange-100 text-orange-800' :
          row.status === 'pending_confirmation' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.payment_status === 'partially_paid' ? 'Partially Paid' : row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {(row.payment_method === 'lipa_mdogo_mdogo' || row.payment_method === 'intasend') && (
            <Button size="sm" variant="ghost" onClick={() => handleOpenHistoryModal(row.id)} icon={Eye}>
              Payments
            </Button>
          )}
          {row.status === 'pending_confirmation' && row.payment_method === 'mpesa' && (
            <Button size="sm" onClick={() => handleApprove(row)} icon={CheckCircle}>
              Approve
            </Button>
          )}
          <button onClick={() => alert('Edit not implemented')} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-bold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">View and manage all customer bookings.</p>
        </div>
      </div>
      <DataTable columns={columns} data={bookings} />
      {selectedBookingId && (
        <PaymentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          bookingId={selectedBookingId}
        />
      )}
    </div>
  );
};

export default BookingsManagement;
