import React, { useEffect, useState } from 'react';
import { supabase, Partner } from '../../lib/supabase';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import PartnerForm from '../../components/admin/PartnerForm';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Button } from '../../components/UI/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';

const PartnersManagement: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('partners').select('*').order('name', { ascending: true });
      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (partner: Partner | null = null) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  const handleSubmit = async (formData: any) => {
    setFormLoading(true);
    try {
      if (selectedPartner) {
        const { error } = await supabase.from('partners').update(formData).eq('id', selectedPartner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('partners').insert(formData);
        if (error) throw error;
      }
      fetchPartners();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save partner:', err);
      alert('Failed to save partner.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (window.confirm(`Are you sure you want to delete "${partner.name}"?`)) {
      const { error } = await supabase.from('partners').delete().eq('id', partner.id);
      if (error) {
        alert('Failed to delete partner.');
      } else {
        fetchPartners();
      }
    }
  };
  
  const columns: Column<Partner>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Commission', accessor: 'commission_percentage', render: (row: Partner) => `${row.commission_percentage}%` },
    { header: 'Status', accessor: 'agreement_status', render: (row: Partner) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
          row.agreement_status === 'active' ? 'bg-green-100 text-green-800' :
          row.agreement_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.agreement_status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} icon={Edit} />
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(row)} icon={Trash2} />
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partners Management</h1>
          <p className="text-gray-600 mt-2">Manage all tourism partners and their agreements.</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          New Partner
        </Button>
      </div>
      <DataTable columns={columns} data={partners} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedPartner ? 'Edit Partner' : 'Create New Partner'}>
        <PartnerForm 
          partner={selectedPartner} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
          loading={formLoading} 
        />
      </Modal>
    </div>
  );
};

export default PartnersManagement;
