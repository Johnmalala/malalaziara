import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Listing } from '../../lib/supabase';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import ListingForm from '../../components/admin/ListingForm';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Button } from '../../components/UI/Button';
import { Plus, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import AvailabilityCalendar from '../../components/admin/AvailabilityCalendar';
import { useCurrency } from '../../contexts/CurrencyContext';

const ListingsManagement: React.FC = () => {
  const { convert } = useCurrency();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [listingForCalendar, setListingForCalendar] = useState<Listing | null>(null);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [currentUnavailableDates, setCurrentUnavailableDates] = useState<string[]>([]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleOpenCalendarModal = (listing: Listing) => {
    setListingForCalendar(listing);
    setIsCalendarModalOpen(true);
  };

  const handleCloseCalendarModal = () => {
    setIsCalendarModalOpen(false);
    setListingForCalendar(null);
    setCurrentUnavailableDates([]);
  };

  const handleAvailabilityChange = (dates: string[]) => {
    setCurrentUnavailableDates(dates);
  };

  const handleSaveAvailability = async () => {
    if (!listingForCalendar) return;
    setAvailabilitySaving(true);
    try {
      await supabase.from('listing_availability').delete().eq('listing_id', listingForCalendar.id);
      
      if (currentUnavailableDates.length > 0) {
        const availabilityToInsert = currentUnavailableDates.map((date: string) => ({
          listing_id: listingForCalendar.id,
          unavailable_date: new Date(date).toISOString().split('T')[0],
        }));
        const { error: availabilityError } = await supabase.from('listing_availability').insert(availabilityToInsert);
        if (availabilityError) throw availabilityError;
      }
      
      handleCloseCalendarModal();
    } catch (err) {
      console.error('Failed to save availability:', err);
      alert('Failed to save availability.');
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handleOpenModal = (listing: Listing | null = null) => {
    setSelectedListing(listing);
setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const handleSubmit = async (formData: any) => {
    setFormLoading(true);
    try {
      if (selectedListing) {
        const { error } = await supabase.from('listings').update(formData).eq('id', selectedListing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('listings').insert(formData).select('id').single();
        if (error) throw error;
      }
      fetchListings();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save listing:', err);
      alert('Failed to save listing.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (listing: Listing) => {
    if (window.confirm(`Are you sure you want to delete "${listing.title}"?`)) {
      const { error } = await supabase.from('listings').delete().eq('id', listing.id);
      if (error) {
        alert('Failed to delete listing.');
      } else {
        fetchListings();
      }
    }
  };

  const columns: Column<Listing>[] = [
    { header: 'Title', accessor: 'title' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'price', render: (row: Listing) => convert(row.price) },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', accessor: 'status', render: (row: Listing) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'id', 
      render: (row: Listing) => (
        <div className="flex items-center space-x-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleOpenCalendarModal(row)}
                icon={CalendarIcon}
            >
                Availability
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} icon={Edit} />
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(row)} icon={Trash2} />
        </div>
      )
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listings Management</h1>
          <p className="text-gray-600 mt-2">Manage all tours, stays, and volunteer opportunities.</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          New Listing
        </Button>
      </div>
      <DataTable columns={columns} data={listings} />
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedListing ? 'Edit Listing' : 'Create New Listing'}>
        <ListingForm 
          listing={selectedListing} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
          loading={formLoading} 
        />
      </Modal>

      <Modal isOpen={isCalendarModalOpen} onClose={handleCloseCalendarModal} title={`Manage Availability for ${listingForCalendar?.title}`}>
        <AvailabilityCalendar 
            listingId={listingForCalendar?.id}
            onDatesChange={handleAvailabilityChange} 
        />
        <div className="flex justify-end mt-4 space-x-2">
            <Button variant="ghost" onClick={handleCloseCalendarModal}>Cancel</Button>
            <Button onClick={handleSaveAvailability} loading={availabilitySaving}>Save Availability</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ListingsManagement;
