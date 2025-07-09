import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadImageToCloudinary = async (base64Image, folder = 'embroidery-designs', publicId = null) => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    };

    // Add custom public_id if provided
    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.unique_filename = false;
      uploadOptions.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    console.log(`Attempting to delete image from Cloudinary: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary delete result for ${publicId}:`, result);
    
    // Cloudinary returns 'ok' for successful deletion, 'not found' if image doesn't exist
    const isSuccess = result.result === 'ok' || result.result === 'not found';
    
    return {
      success: isSuccess,
      result: result.result,
      publicId: publicId
    };
  } catch (error) {
    console.error(`Cloudinary delete error for ${publicId}:`, error);
    return {
      success: false,
      error: error.message,
      publicId: publicId
    };
  }
};

export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 400,
    height = 300,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format
  });
};

export default cloudinary;
