import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { UploadCloud, Trash2, AlertCircle, Image } from 'lucide-react';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { motion } from 'framer-motion';

interface SingleImageUploaderProps {
  bucketName: string;
  currentUrl: string | null;
  onUpload: (url: string) => void;
  label: string;
}

const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({ bucketName, currentUrl, onUpload, label }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // If there's an old image, delete it first
      if (currentUrl) {
        const oldFilePath = currentUrl.split(`/${bucketName}/`)[1];
        if (oldFilePath) {
          await supabase.storage.from(bucketName).remove([oldFilePath]);
        }
      }

      // Upload the new image
      const filePath = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get public URL and call the callback
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      onUpload(publicUrl);

    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl) return;
    
    const filePath = currentUrl.split(`/${bucketName}/`)[1];
    if (!filePath) {
      setError('Could not determine file path to delete.');
      return;
    }
    
    // Optimistically update UI
    onUpload('');

    const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath]);
    if (deleteError) {
      setError('Failed to delete image. Please try again.');
      onUpload(currentUrl); // Revert on error
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="Banner Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center space-x-2">
              <label className="p-3 bg-white/80 text-gray-800 rounded-full cursor-pointer hover:bg-white transition-colors">
                <UploadCloud className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
              </label>
              <button onClick={handleDelete} className="p-3 bg-red-600/80 text-white rounded-full hover:bg-red-600 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <label className="text-center cursor-pointer p-4">
            {uploading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                <p className="text-xs text-gray-500 mt-1">Recommended: 1920x1080px</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
        )}
        {uploading && (
           <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
             <LoadingSpinner />
           </div>
        )}
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

export default SingleImageUploader;
