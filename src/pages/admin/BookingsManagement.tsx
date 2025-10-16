import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Booking } from '../../lib/supabase';
import DataTable, { Column } from '../../components/admin/DataTable';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Button } from '../../components/UI/Button';
import { CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

type BookingWithListing = Booking & {
  listings: { id: string; title: string } | null;
};

const BookingsManagement: React.FC = () => {
  const { convert } = useCurrency();
  const [bookings, setBookings] = useState<BookingWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  const handleApprove = async (bookingId: string) => {
    if (window.confirm(`Are you sure you want to approve this M-Pesa payment? This will mark the booking as confirmed.`)) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      
      if (updateError) alert('Failed to approve booking.');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (window.confirm(`Are you sure you want to delete this booking? This will also delete all associated payments.`)) {
      await supabase.from('booking_payments').delete().eq('booking_id', bookingId);
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
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
      render: (row) => convert(row.amount)
    },
    {
      header: 'M-Pesa Code',
      accessor: 'mpesa_code',
      render: (row) => row.mpesa_code || 'N/A'
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${
          row.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          row.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending' && row.payment_method === 'mpesa' && (
            <Button size="sm" onClick={() => handleApprove(row.id)} icon={CheckCircle}>
              Approve
            </Button>
          )}
          <button onClick={() => alert('Edit not implemented')} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-100">
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
    </div>
  );
};

export default BookingsManagement;
