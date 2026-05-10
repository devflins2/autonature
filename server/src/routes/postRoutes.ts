import { Router } from 'express';
import { publishPost, quickPublish } from '../controllers/postController';

import Post from '../models/Post';

const router = Router();

// Create a new post (internal use for now)
router.post('/create', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Publish a post immediately
router.post('/publish', publishPost);
router.post('/quick-publish', quickPublish);


export default router;
