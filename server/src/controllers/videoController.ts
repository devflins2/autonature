import { Request, Response } from 'express';
import { generateReelFromImage } from '../services/videoService';
import path from 'path';
import { runAutoPilot } from '../services/schedulerService';

export const createReel = async (req: Request, res: Response) => {
  // ... (kept same)
  const { imageUrl, audioUrl, duration } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ success: false, message: 'Image URL is required' });
  }

  try {
    const videoPath = await generateReelFromImage(imageUrl, audioUrl, duration || 7);
    const fileName = path.basename(videoPath);
    
    // We return the URL where the video can be accessed
    const videoUrl = `${req.protocol}://${req.get('host')}/temp/${fileName}`;
    
    res.json({ 
      success: true, 
      message: 'Reel generated successfully', 
      videoUrl 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const triggerAutoPilotManual = async (req: Request, res: Response) => {
  try {
    await runAutoPilot();
    res.json({ success: true, message: 'Auto-Pilot triggered successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

