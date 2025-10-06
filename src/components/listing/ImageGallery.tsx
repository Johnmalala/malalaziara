import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const placeholderUrl = `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x800/dc2626/white?text=${encodeURIComponent('Ziarazetu')}`;
  const validImages = images && images.length > 0 ? images : [placeholderUrl];

  // State for mobile view's selected image
  const [selectedImage, setSelectedImage] = useState(validImages[0]);

  // Prepare images for desktop view
  const desktopMainImage = validImages[0];
  const desktopGalleryImages = validImages.slice(1, 5);
  while (desktopGalleryImages.length < 4) {
    desktopGalleryImages.push(`https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x300/f3f4f6/9ca3af?text=`);
  }

  return (
    <div className="mt-6">
      {/* Desktop View - Grid layout */}
      <div className="hidden lg:grid grid-cols-2 gap-2">
        <motion.div 
          className="w-full h-96 rounded-lg overflow-hidden shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={desktopMainImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="grid grid-cols-2 gap-2">
          {desktopGalleryImages.map((image, index) => (
            <motion.div
              key={index}
              className="w-full h-full rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={image}
                alt={`${title} - view ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile & Tablet View - Scroller */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedImage}
            className="w-full h-64 md:h-80 rounded-lg overflow-hidden mb-3 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img src={selectedImage} alt={title} className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>

        {validImages.length > 1 && (
          <div className="flex overflow-x-auto space-x-2 pb-2 -mx-4 px-4">
            {validImages.map((image, index) => (
              <motion.div
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-colors ${selectedImage === image ? 'border-red-500' : 'border-transparent'}`}
                whileTap={{ scale: 0.95 }}
              >
                <img src={image} alt={`${title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
