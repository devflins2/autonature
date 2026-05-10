import { Router, Request, Response } from 'express';
import Song from '../models/Song';

const router = Router();

// Get all songs
router.get('/', async (req: Request, res: Response) => {
  try {
    const songs = await Song.find();
    res.json({ success: true, data: songs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new song
router.post('/', async (req: Request, res: Response) => {
  try {
    const song = await Song.create(req.body);
    res.json({ success: true, data: song });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a song
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Song deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
