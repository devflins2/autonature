import { Request, Response } from 'express';
import { postToInstagramReel, postToInstagramImage, postToFacebookPage, postVideoToFacebookPage } from '../services/metaService';
import Post from '../models/Post';
import Log from '../models/Log';
import { uploadToPublicHost } from '../services/videoService';

export const publishPost = async (req: Request, res: Response) => {
  const { postId } = req.body;


  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    let result;
    
    if (post.platform === 'instagram' || post.platform === 'both') {
      if (post.mediaType === 'video') {
        result = await postToInstagramReel(post.mediaUrl, post.description);
      } else {
        result = await postToInstagramImage(post.mediaUrl, post.description);
      }
    }

    if (post.platform === 'facebook' || post.platform === 'both') {
      if (post.mediaType === 'video') {
        await postVideoToFacebookPage(post.mediaUrl, post.description);
      } else {
        await postToFacebookPage(post.mediaUrl, post.description);
      }
    }

    post.status = 'posted';
    post.postedAt = new Date();
    await post.save();

    await Log.create({ message: `Successfully posted to ${post.platform}`, level: 'info' });
    res.json({ success: true, data: result });
  } catch (error: any) {
    await Log.create({ message: `Failed to post: ${error.message}`, level: 'error' });
    res.status(500).json({ success: false, error: error.message });
  }
};

export const quickPublish = async (req: Request, res: Response) => {
  const { mediaUrl, mediaType, description, platform } = req.body;

  try {
    let result;
    if (platform === 'instagram' || platform === 'both') {
      if (mediaType === 'video') {
        result = await postToInstagramReel(mediaUrl, description);
      } else {
        result = await postToInstagramImage(mediaUrl, description);
      }
    }

    if (platform === 'facebook' || platform === 'both') {
      if (mediaType === 'video') {
        await postVideoToFacebookPage(mediaUrl, description);
      } else {
        await postToFacebookPage(mediaUrl, description);
      }
    }

    await Post.create({
      title: 'Manual Quick Post',
      description,
      mediaUrl,
      mediaType,
      platform,
      status: 'posted',
      postedAt: new Date()
    });

    await Log.create({ message: `Manual Quick Post successful to ${platform}`, level: 'info' });
    res.json({ success: true, data: result });
  } catch (error: any) {
    await Log.create({ message: `Manual Quick Post failed: ${error.message}`, level: 'error' });
    res.status(500).json({ success: false, error: error.message });
  }
};
