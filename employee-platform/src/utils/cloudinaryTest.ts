// Test utility to verify Cloudinary configuration
export const testCloudinaryConfig = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    console.log('🔍 [Cloudinary Test] Configuration check:');
    console.log('- Cloud Name:', cloudName);
    console.log('- Upload Preset:', uploadPreset);
    console.log('- Is configured:', cloudName !== 'your-cloud-name' && uploadPreset !== 'hris-documents');

    return {
        cloudName,
        uploadPreset,
        isConfigured: cloudName !== 'your-cloud-name' && uploadPreset !== 'hris-documents'
    };
};
