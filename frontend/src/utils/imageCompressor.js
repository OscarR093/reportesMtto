// frontend/src/utils/imageCompressor.js
import imageCompression from 'browser-image-compression';

/**
 * Compress image for upload to reduce file size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = async (file, options = {}) => {
  // Don't compress if it's already a very small file
  if (file.size < 100 * 1024) { // Less than 100KB
    return file;
  }

  // Don't compress non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const defaultOptions = {
    maxSizeMB: 1,           // Aim for 1MB max
    maxWidthOrHeight: 1920, // Max resolution 1920px (landscape)
    useWebP: true,          // Convert to WebP for better compression
    quality: 0.8,           // 80% quality (good balance)
    maxIteration: 10,       // Max attempts to reach target size
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // If the compression converted to WebP but the name still has the old extension,
    // create a new File with the correct extension
    if (compressionOptions.useWebP && file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const newFileName = `${nameWithoutExt}.webp`;
      
      return new File([compressedFile], newFileName, {
        type: 'image/webp',
        lastModified: Date.now()
      });
    }
    
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed, returning original:', error);
    // Return original file if compression fails
    return file;
  }
};

/**
 * Validate if image is already optimized (small size and good format)
 * @param {File} file - The image file to check
 * @returns {boolean} - True if image is already optimized
 */
export const isAlreadyOptimized = (file) => {
  // Consider as already optimized if it's smaller than 2MB and in a good format
  const isSmallFile = file.size < 2 * 1024 * 1024; // Less than 2MB
  const isOptimalFormat = ['.webp', '.jpg', '.jpeg'].includes(
    file.name.toLowerCase().split('.').pop()
  );
  
  return isSmallFile && isOptimalFormat;
};