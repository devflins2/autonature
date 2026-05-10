import axios from 'axios';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const API_VERSION = 'v20.0';


/**
 * Post an Image to Instagram
 */
export const postToInstagramImage = async (imageUrl: string, caption: string) => {
  try {
    // 1. Create Media Container for Image
    const containerRes = await axios.post(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_ACCOUNT_ID}/media`, {
      image_url: imageUrl,
      caption: caption,
      access_token: META_ACCESS_TOKEN
    });

    const creationId = containerRes.data.id;

    // 2. Publish the Photo
    const publishRes = await axios.post(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_ACCOUNT_ID}/media_publish`, {
      creation_id: creationId,
      access_token: META_ACCESS_TOKEN
    });

    return publishRes.data;
  } catch (error: any) {
    console.error('Instagram Photo Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Post a Reel to Instagram
 */
export const postToInstagramReel = async (videoUrl: string, caption: string) => {
  try {
    // 1. Create Media Container for Reel
    const containerRes = await axios.post(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_ACCOUNT_ID}/media`, {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption,
      access_token: META_ACCESS_TOKEN
    });

    const creationId = containerRes.data.id;

    // 2. Wait for processing (Polling)
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status === 'IN_PROGRESS' && attempts < 20) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${creationId}`, {
        params: {
          fields: 'status_code,status',
          access_token: META_ACCESS_TOKEN
        }
      });

      status = statusRes.data.status_code;
      console.log(`📽️ Reel Status [Attempt ${attempts}]:`, status);
      
      if (status === 'FINISHED') break;
      if (status === 'ERROR') {
        throw new Error(`Meta processing failed. Check your video format or account status.`);
      }

    }

    if (status !== 'FINISHED') {
      throw new Error('Meta processing timed out (Video might be too large or URL unreachable)');
    }

    // 3. Publish
    console.log('🚀 Publishing Reel...');
    const publishRes = await axios.post(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_ACCOUNT_ID}/media_publish`, {
      creation_id: creationId,
      access_token: META_ACCESS_TOKEN
    });

    return publishRes.data;
  } catch (error: any) {
    const errorData = error.response?.data?.error?.message || error.message;
    console.error('❌ Instagram Reel Error:', errorData);
    throw new Error(errorData);
  }
};


/**
 * Post a Photo to Facebook Page
 */
export const postToFacebookPage = async (imageUrl: string, message: string) => {
  try {
    const res = await axios.post(`https://graph.facebook.com/${API_VERSION}/${FACEBOOK_PAGE_ID}/photos`, {
      url: imageUrl,
      caption: message, // Some versions use caption, some use message
      access_token: META_ACCESS_TOKEN
    });
    return res.data;
  } catch (error: any) {
    console.error('Facebook Post Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Post a Video to Facebook Page
 */
export const postVideoToFacebookPage = async (videoUrl: string, message: string) => {
  try {
    const res = await axios.post(`https://graph.facebook.com/${API_VERSION}/${FACEBOOK_PAGE_ID}/videos`, {
      file_url: videoUrl,
      description: message,
      access_token: META_ACCESS_TOKEN
    });
    return res.data;
  } catch (error: any) {
    console.error('Facebook Video Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch insights for a specific Instagram Media ID
 */
export const getMediaInsights = async (mediaId: string) => {
  try {
    // 1. Fetch Basic Fields (Likes/Comments)
    const basicRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${mediaId}`, {
      params: {
        fields: 'like_count,comments_count,media_url',
        access_token: META_ACCESS_TOKEN
      }
    });


    // 2. Fetch Insights (Reach/Views)
    const insightRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${mediaId}/insights`, {
      params: {
        metric: 'reach,impressions,saved,video_views',
        access_token: META_ACCESS_TOKEN
      }
    });

    const insights: any = {
      likes: basicRes.data.like_count || 0,
      comments: basicRes.data.comments_count || 0,
      media_url: basicRes.data.media_url // Fetch the live CDN link from Instagram
    };


    insightRes.data.data.forEach((item: any) => {
      insights[item.name] = item.values[0].value;
    });

    return insights;
  } catch (error: any) {
    return { reach: 0, impressions: 0, video_views: 0, saved: 0, likes: 0, comments: 0 };
  }
};



