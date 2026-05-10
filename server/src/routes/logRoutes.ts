import { Router } from 'express';
import Log from '../models/Log';

const router = Router();

// Get all logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
