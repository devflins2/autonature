import { Router } from 'express';
import { getImages, getCloudinaryPool } from '../controllers/mediaController';

const router = Router();

router.get('/images', getImages);
router.get('/cloudinary-pool', getCloudinaryPool);

export default router;
