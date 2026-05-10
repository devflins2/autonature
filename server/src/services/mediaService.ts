import axios from 'axios';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

export interface MediaItem {
  id: string;
  url: string;
  previewUrl: string;
  source: 'pexels' | 'pixabay';
  type: 'image' | 'video';
}

export const fetchImages = async (query: string = 'nature', perPage: number = 10): Promise<MediaItem[]> => {
  const results: MediaItem[] = [];

  try {
    // Fetch from Pexels
    if (PEXELS_API_KEY) {
      const pexelsRes = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      const pexelsItems: MediaItem[] = pexelsRes.data.photos.map((photo: any) => ({
        id: photo.id.toString(),
        url: photo.src.large2x,
        previewUrl: photo.src.medium,
        source: 'pexels',
        type: 'image'
      }));
      results.push(...pexelsItems);
    }

    // Fetch from Pixabay
    if (PIXABAY_API_KEY) {
      const pixabayRes = await axios.get(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo`);
      const pixabayItems: MediaItem[] = pixabayRes.data.hits.map((hit: any) => ({
        id: hit.id.toString(),
        url: hit.largeImageURL,
        previewUrl: hit.previewURL,
        source: 'pixabay',
        type: 'image'
      }));
      results.push(...pixabayItems);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }

  return results;
};

export const fetchVideos = async (query: string = 'nature', perPage: number = 10): Promise<MediaItem[]> => {
  const results: MediaItem[] = [];

  try {
    // Fetch from Pexels
    if (PEXELS_API_KEY) {
      const pexelsRes = await axios.get(`https://api.pexels.com/videos/search?query=${query}&per_page=${perPage}`, {
        headers: { Authorization: PEXELS_API_KEY }
      });
      const pexelsItems: MediaItem[] = pexelsRes.data.videos.map((video: any) => ({
        id: video.id.toString(),
        url: video.video_files.find((f: any) => f.quality === 'hd')?.link || video.video_files[0].link,
        previewUrl: video.image,
        source: 'pexels',
        type: 'video'
      }));
      results.push(...pexelsItems);
    }

    // Fetch from Pixabay
    if (PIXABAY_API_KEY) {
      const pixabayRes = await axios.get(`https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}`);
      const pixabayItems: MediaItem[] = pixabayRes.data.hits.map((hit: any) => ({
        id: hit.id.toString(),
        url: hit.videos.medium?.url || hit.videos.small?.url,
        previewUrl: `https://i.vimeocdn.com/video/${hit.picture_id}_640x360.jpg`,
        source: 'pixabay',
        type: 'video'
      }));
      results.push(...pixabayItems);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
  }

  return results;
};

