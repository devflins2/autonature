import axios from 'axios';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

/**
 * Fetches all media items from Cloudinary using SEARCH API
 */
export const fetchAllFromCloudinary = async (type: 'video' | 'image' | 'all' = 'all') => {
  if (!cloudName || !apiKey || !apiSecret) return [];

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    let expression = '';
    if (type === 'video') expression = 'resource_type:video';
    else if (type === 'image') expression = 'resource_type:image';
    else expression = 'resource_type:video OR resource_type:image';

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        expression: expression,
        max_results: 50,
        sort_by: [{ created_at: 'desc' }]
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return (res.data.resources || []).map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      previewUrl: resource.secure_url, // For videos, Cloudinary generates thumbnails automatically if requested, but secure_url works for simple display
      resource_type: resource.resource_type,
      keyword: resource.public_id.split('/').pop()?.split('_')[0] || 'nature'
    }));
  } catch (error: any) {
    console.error(`❌ Cloudinary Search All Error:`, error.response?.data || error.message);
    return [];
  }
};

const fetchOneFromCloudinary = async (type: 'video' | 'image') => {
  if (!cloudName || !apiKey || !apiSecret) return null;

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        expression: `resource_type:${type}`,
        max_results: 1,
        sort_by: [{ created_at: 'asc' }]
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (res.data.resources && res.data.resources.length > 0) {
      const resource = res.data.resources[0];
      return {
        url: resource.secure_url,
        publicId: resource.public_id,
        keyword: resource.public_id.split('/').pop()?.split('_')[0] || 'nature',
        type: type
      };
    }
    return null;
  } catch (error: any) {
    return null;
  }
};

export const fetchOneVideoFromCloudinary = () => fetchOneFromCloudinary('video');
export const fetchOneImageFromCloudinary = () => fetchOneFromCloudinary('image');

export const deleteMediaFromCloudinary = async (publicId: string, type: 'video' | 'image') => {
  if (!cloudName || !apiKey || !apiSecret) return false;
  try {
    const crypto = await import('crypto');
    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto.createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`,
      {
        public_id: publicId,
        api_key: apiKey,
        timestamp: timestamp,
        signature: signature
      }
    );
    return true;
  } catch (error: any) {
    console.error(`❌ Cloudinary Delete Error [${publicId}]:`, error.response?.data || error.message);
    return false;
  }
};
