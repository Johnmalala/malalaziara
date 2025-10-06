import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Listing, ItineraryItem } from '../../lib/supabase';
import { Button } from '../UI/Button';
import ImageUploader from './ImageUploader';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const itineraryItemSchema = z.object({
  day: z.coerce.number().min(1, 'Day number is required'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
});

const listingSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.enum(['experience', 'stay', 'volunteer']),
  sub_category: z.string().min(1, 'Sub-category is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  location: z.string().min(3, 'Location is required'),
  status: z.enum(['active', 'inactive']),
  images: z.array(z.string()).optional().default([]),
  inclusions: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  exclusions: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  itinerary: z.array(itineraryItemSchema).optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  listing?: Listing | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const stepsConfig = [
  { name: 'Basic Info', fields: ['title', 'description', 'category', 'sub_category'] },
  { name: 'Details', fields: ['price', 'location', 'status', 'inclusions', 'exclusions'] },
  { name: 'Itinerary', forCategory: 'experience' },
  { name: 'Media', fields: ['images'] },
];

const subCategoryOptions = {
  experience: ['safari', 'event', 'single-day-tour', 'multi-day-tour', 'cultural'],
  stay: ['lodge', 'hotel', 'campsite', 'resort', 'apartment', 'airbnb'],
  volunteer: ['community-development', 'wildlife-conservation', 'education', 'environmental'],
};

const ListingForm: React.FC<ListingFormProps> = ({ listing, onSubmit, onCancel, loading }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, formState: { errors }, control, watch, trigger, setValue } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title || '',
      description: listing?.description || '',
      category: listing?.category || 'experience',
      sub_category: listing?.sub_category || '',
      price: listing?.price || 0,
      location: listing?.location || '',
      status: listing?.status || 'active',
      images: listing?.images || [],
      inclusions: listing?.inclusions?.join(', ') || '',
      exclusions: listing?.exclusions?.join(', ') || '',
      itinerary: listing?.itinerary || [{ day: 1, title: '', description: '' }],
    },
  });
  
  const watchedCategory = watch('category');

  useEffect(() => {
    setValue('sub_category', '');
  }, [watchedCategory, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itinerary"
  });

  const processForm = (data: ListingFormData) => {
    if (data.category !== 'experience') {
      data.itinerary = [];
    }
    onSubmit(data);
  };

  const steps = stepsConfig.filter(step => !step.forCategory || step.forCategory === watchedCategory);

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-6">
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => (
            <li key={step.name} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:inline-block" : ""}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors ${index <= currentStep ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {index < currentStep ? <CheckCircleIcon /> : index + 1}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Basic Information</h3>
              <InputField id="title" label="Title" register={register} error={errors.title} />
              <TextareaField id="description" label="Description" register={register} error={errors.description} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField id="category" label="Category" options={['experience', 'stay', 'volunteer']} register={register} error={errors.category} />
                <SelectField id="sub_category" label="Sub-category" options={subCategoryOptions[watchedCategory] || []} register={register} error={errors.sub_category} />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Details & Inclusions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="price" label="Price" type="number" register={register} error={errors.price} />
                <InputField id="location" label="Location" register={register} error={errors.location} />
              </div>
              <SelectField id="status" label="Status" options={['active', 'inactive']} register={register} error={errors.status} />
              <TextareaField id="inclusions" label="Inclusions (comma-separated)" register={register} error={errors.inclusions} />
              <TextareaField id="exclusions" label="Exclusions (comma-separated)" register={register} error={errors.exclusions} />
            </div>
          )}

          {currentStep === 2 && watchedCategory === 'experience' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Tour Itinerary</h3>
              {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3 relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <InputField id={`itinerary.${index}.day`} label="Day" type="number" register={register} error={errors.itinerary?.[index]?.day} />
                    <div className="md:col-span-2">
                      <InputField id={`itinerary.${index}.title`} label="Title" register={register} error={errors.itinerary?.[index]?.title} />
                    </div>
                  </div>
                  <TextareaField id={`itinerary.${index}.description`} label="Description" register={register} error={errors.itinerary?.[index]?.description} />
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => append({ day: fields.length + 1, title: '', description: '' })}>
                Add Day
              </Button>
            </div>
          )}
          
          {(currentStep === (watchedCategory === 'experience' ? 3 : 2)) && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Media</h3>
              <Controller name="images" control={control} render={({ field }) => <ImageUploader initialUrls={field.value} onUrlsChange={field.onChange} />} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
          <ArrowLeft className="w-4 h-4 mr-2"/> Back
        </Button>
        <div>
          <Button type="button" variant="outline" onClick={onCancel} className="mr-2">Cancel</Button>
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              {listing ? 'Update Listing' : 'Create Listing'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

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
    <textarea id={id} {...register(id)} rows={3} className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`} />
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const SelectField = ({ id, label, options, register, error }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select id={id} {...register(id)} className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 capitalize`} disabled={!options.length}>
      <option value="">Select {label}...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{(opt).replace('-', ' ')}</option>)}
    </select>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

export default ListingForm;
