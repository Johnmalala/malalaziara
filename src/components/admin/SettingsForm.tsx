import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SiteSettings } from '../../lib/supabase';
import { Button } from '../UI/Button';
import SingleImageUploader from './SingleImageUploader';
import { AlertCircle, CheckCircle } from 'lucide-react';

const settingsSchema = z.object({
  banner_url: z.string().url('A banner image is required.').or(z.literal('')),
  banner_title: z.string().min(5, 'Title is required'),
  banner_subtitle: z.string().min(10, 'Subtitle is required'),
  contact_email: z.string().email('Must be a valid email'),
  contact_phone: z.string().min(10, 'Must be a valid phone number'),
  address: z.string().min(10, 'Address is required'),
  signin_image_url: z.string().url().or(z.literal('')),
  signup_image_url: z.string().url().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: SiteSettings | null;
  onSubmit: (data: any) => void;
  loading: boolean;
  error?: string | null;
  success?: string | null;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData, onSubmit, loading, error, success }) => {
  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    // Initialize with empty values, useEffect will populate it
    defaultValues: {
      banner_url: '',
      banner_title: '',
      banner_subtitle: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      signin_image_url: '',
      signup_image_url: '',
    },
  });

  // This useEffect hook is the key to solving the pre-filling issue.
  // It waits for the initialData to be loaded and then resets the form with those values.
  useEffect(() => {
    if (initialData) {
      reset({
        banner_url: initialData.banner_url || '',
        banner_title: initialData.banner_title || '',
        banner_subtitle: initialData.banner_subtitle || '',
        contact_email: initialData.contact_email || '',
        contact_phone: initialData.contact_phone || '',
        address: initialData.address || '',
        signin_image_url: initialData.signin_image_url || '',
        signup_image_url: initialData.signup_image_url || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border">
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

      <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Hero Section</h3>
      
      <Controller
        name="banner_url"
        control={control}
        render={({ field }) => (
          <SingleImageUploader
            bucketName="site_assets"
            currentUrl={field.value}
            onUpload={field.onChange}
            label="Banner Image"
          />
        )}
      />
      {errors.banner_url && <p className="text-sm text-red-600 mt-1">{errors.banner_url.message}</p>}

      <InputField id="banner_title" label="Banner Title" register={register} error={errors.banner_title} />
      <TextareaField id="banner_subtitle" label="Banner Subtitle" register={register} error={errors.banner_subtitle} />

      <h3 className="text-xl font-bold text-gray-800 border-b pb-4 pt-4">Contact Information</h3>
      <InputField id="contact_email" label="Contact Email" type="email" register={register} error={errors.contact_email} />
      <InputField id="contact_phone" label="Contact Phone" type="tel" register={register} error={errors.contact_phone} />
      <InputField id="address" label="Company Address" register={register} error={errors.address} />
      
      <h3 className="text-xl font-bold text-gray-800 border-b pb-4 pt-4">Authentication Page Images</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Controller
          name="signin_image_url"
          control={control}
          render={({ field }) => (
            <SingleImageUploader
              bucketName="site_assets"
              currentUrl={field.value}
              onUpload={field.onChange}
              label="Sign In Page Image"
            />
          )}
        />
        <Controller
          name="signup_image_url"
          control={control}
          render={({ field }) => (
            <SingleImageUploader
              bucketName="site_assets"
              currentUrl={field.value}
              onUpload={field.onChange}
              label="Sign Up Page Image"
            />
          )}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" loading={loading}>Save Settings</Button>
      </div>
    </form>
  );
};

const InputField = ({ id, label, register, error, type = 'text' }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input id={id} type={type} {...register(id)} className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`} />
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const TextareaField = ({ id, label, register, error }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea id={id} {...register(id)} rows={2} className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`} />
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

export default SettingsForm;
