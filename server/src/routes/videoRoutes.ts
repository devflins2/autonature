import { Router } from 'express';
import { createReel, triggerAutoPilotManual } from '../controllers/videoController';

const router = Router();

router.post('/generate-reel', createReel);
router.post('/test-auto', triggerAutoPilotManual);

export default router;

