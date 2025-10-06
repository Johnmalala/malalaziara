import React, { useEffect, useState, useCallback } from 'react';
import { supabase, CustomPackageRequest } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Mail, Phone, User, Calendar, Users, DollarSign, Map, Heart, Package, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RequestsManagement: React.FC = () => {
  const [requests, setRequests] = useState<CustomPackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('custom_package_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setRequests(data as CustomPackageRequest[]);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError('Failed to load package requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();

    const channel = supabase.channel('custom-requests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_package_requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const handleStatusChange = async (id: string, status: 'new' | 'contacted' | 'closed') => {
    const { error: updateError } = await supabase
      .from('custom_package_requests')
      .update({ status })
      .eq('id', id);
    
    if (updateError) {
      alert('Failed to update status.');
    }
  };

  if (loading && requests.length === 0) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return <div className="text-center py-10 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Custom Package Requests</h1>
        <p className="text-gray-600 mt-2">Review and manage custom travel requests from customers.</p>
      </div>
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <Package className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-800 mt-4">No Requests Found</h3>
          <p className="text-gray-500 mt-2">When a customer requests a custom package, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((request) => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-sm border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{request.title}</h3>
                    <p className="text-sm text-gray-500">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      request.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                    <select 
                      value={request.status} 
                      onChange={(e) => handleStatusChange(request.id, e.target.value as any)}
                      className="text-xs border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wider">Contact Info</h4>
                    <div className="space-y-2">
                      <InfoItem icon={User} label="Customer" value={request.name} />
                      <InfoItem icon={Mail} label="Email" value={<a href={`mailto:${request.email}`} className="text-red-600 hover:underline">{request.email}</a>} />
                      <InfoItem icon={Phone} label="Phone" value={request.phone || 'N/A'} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wider">Trip Details</h4>
                    <div className="space-y-2">
                      <InfoItem icon={Map} label="Destination" value={request.destination} />
                      <InfoItem icon={Calendar} label="Dates" value={request.preferred_dates} />
                      <InfoItem icon={Users} label="Group Size" value={`${request.group_size} person(s)`} />
                      <InfoItem icon={DollarSign} label="Budget" value={request.budget_range} />
                    </div>
                  </div>
                   <div>
                    <h4 className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wider">Interests</h4>
                     <div className="flex flex-wrap gap-2">
                       {request.interests?.map(interest => (
                         <span key={interest} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">{interest}</span>
                       ))}
                     </div>
                  </div>
                </div>

                {request.message && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Additional Message</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{request.message}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
  <div className="flex items-start space-x-2">
    <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

export default RequestsManagement;
