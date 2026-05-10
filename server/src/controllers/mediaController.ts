import { Request, Response } from 'express';
import { fetchImages } from '../services/mediaService';
import { fetchAllFromCloudinary } from '../services/cloudinaryService';

export const getImages = async (req: Request, res: Response) => {
  const { query, perPage } = req.query;
  try {
    const images = await fetchImages(
      query ? query.toString() : 'nature',
      perPage ? parseInt(perPage.toString()) : 10
    );
    res.json({ success: true, data: images });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCloudinaryPool = async (req: Request, res: Response) => {
  try {
    const pool = await fetchAllFromCloudinary();
    res.json({ success: true, data: pool });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
