const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Convert callback-based upload to Promise
const uploadToCloudinary = async (file) => {
  try {
    const uploadResult = await promisify(cloudinary.uploader.upload)(file.buffer, {
      resource_type: 'auto',
      folder: 'home_funders'
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file');
  }
};

module.exports = {
  uploadToCloudinary
}; 