import React, { useState, useEffect } from 'react';
import { supabase, SiteSettings } from '../../lib/supabase';
import SettingsForm from '../../components/admin/SettingsForm';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setFormError('Could not load site settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const { error } = await supabase.from('site_settings').upsert({ id: '1', ...formData });
      if (error) throw error;
      
      setFormSuccess('Settings saved successfully! Changes will be reflected live on your site.');
      fetchSettings(); // Re-fetch to ensure form is up-to-date after save
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setFormError('Failed to save settings. Please try again.');
    } finally {
      setFormLoading(false);
      setTimeout(() => {
        setFormSuccess(null);
        setFormError(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-2">Manage global settings for your website. Changes made here will update your live site in real-time.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border flex flex-col justify-center items-center h-96">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading current settings...</p>
          </div>
        ) : (
          <SettingsForm 
            initialData={settings}
            onSubmit={handleSubmit} 
            loading={formLoading}
            error={formError}
            success={formSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsManagement;
