import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UploadCloud, Trash2, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface ImageUploaderProps {
  initialUrls?: string[];
  onUrlsChange: (urls: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ initialUrls = [], onUrlsChange }) => {
  const [imageUrls, setImageUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onUrlsChange(imageUrls);
  }, [imageUrls, onUrlsChange]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      const filePath = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('listing_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing_images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    });

    try {
      const newUrls = await Promise.all(uploadPromises);
      setImageUrls(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload one or more images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    const filePath = urlToDelete.split('/listing_images/')[1];
    if (!filePath) {
      setError('Could not determine file path to delete.');
      return;
    }

    setImageUrls(prev => prev.filter(url => url !== urlToDelete));

    const { error: deleteError } = await supabase.storage
      .from('listing_images')
      .remove([filePath]);
    
    if (deleteError) {
      console.error('Failed to delete image from storage:', deleteError);
      setImageUrls(prev => [...prev, urlToDelete].sort());
      setError('Failed to delete image. Please try again.');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {imageUrls.map(url => (
          <div key={url} className="relative group aspect-square">
            <img src={url} alt="Listing" className="w-full h-full object-cover rounded-lg shadow-sm" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleDeleteImage(url)}
                className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {uploading ? (
            <LoadingSpinner />
          ) : (
            <div className="text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-1 text-xs text-gray-500">Upload</p>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
