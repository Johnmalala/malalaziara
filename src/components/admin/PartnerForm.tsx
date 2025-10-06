import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Partner } from '../../lib/supabase';
import { Button } from '../UI/Button';

const partnerSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  commission_percentage: z.coerce.number().min(0).max(100),
  agreement_status: z.enum(['active', 'pending', 'expired']),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  partner?: Partner | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ partner, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner?.name || '',
      email: partner?.email || '',
      phone: partner?.phone || '',
      address: partner?.address || '',
      commission_percentage: partner?.commission_percentage || 0,
      agreement_status: partner?.agreement_status || 'pending',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField id="name" label="Partner Name" register={register} error={errors.name} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="email" label="Email" type="email" register={register} error={errors.email} />
        <InputField id="phone" label="Phone" type="tel" register={register} error={errors.phone} />
      </div>
      <InputField id="address" label="Address" register={register} error={errors.address} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="commission_percentage" label="Commission (%)" type="number" register={register} error={errors.commission_percentage} />
        <SelectField id="agreement_status" label="Status" options={['active', 'pending', 'expired']} register={register} error={errors.agreement_status} />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{partner ? 'Update Partner' : 'Create Partner'}</Button>
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

const SelectField = ({ id, label, options, register, error }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select id={id} {...register(id)} className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
    </select>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

export default PartnerForm;
