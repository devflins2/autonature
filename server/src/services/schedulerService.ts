import cron from 'node-cron';
import Post from '../models/Post';
import { postToInstagramImage, postToInstagramReel, postToFacebookPage, postVideoToFacebookPage } from './metaService';
import { fetchImages, fetchVideos } from './mediaService';
import { generateReelFromImage, getRandomSong, processVideo, uploadToPublicHost } from './videoService';
import { generateSmartCaption } from './aiService';
import { getSeasonalKeywords } from '../utils/seasonalKeywords';
import Log from '../models/Log';
import path from 'path';
import { fetchOneVideoFromCloudinary, fetchOneImageFromCloudinary, deleteMediaFromCloudinary } from './cloudinaryService';

let isAutoPilotRunning = false;
let nextRunTime: Date | null = null;

export const getNextRunTime = () => nextRunTime;

// ─── AUTO-RETRY HELPER ───────────────────────────────────────────────────────
// Retries an async function up to `maxAttempts` times with exponential backoff.
const withRetry = async <T>(fn: () => Promise<T>, maxAttempts: number = 3, label: string = 'operation'): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxAttempts) {
        console.error(`❌ [${label}] All ${maxAttempts} attempts failed.`);
        throw error;
      }
      const delayMs = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
      console.warn(`⚠️ [${label}] Attempt ${attempt} failed. Retrying in ${delayMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`[${label}] Retry logic exhausted unexpectedly.`);
};

// ─── MAIN AUTO-PILOT ─────────────────────────────────────────────────────────
export const runAutoPilot = async () => {
  if (isAutoPilotRunning) {
    console.log('⏳ Auto-Pilot is already running. Skipping this cycle...');
    return;
  }

  isAutoPilotRunning = true;
  let postedKeyword = '';

  try {
    const now = new Date();
    const hour = now.getHours();
    console.log(`🤖 Auto-Pilot [Hour ${hour}]: Starting auto-post...`);

    const seasonalKeywords = getSeasonalKeywords();
    const randomKeyword = seasonalKeywords[Math.floor(Math.random() * seasonalKeywords.length)];
    const randomSong = await getRandomSong(randomKeyword);

    // --- PRIORITY 1: Cloudinary Video ---
    // ✅ Keep original audio — Cloudinary nature videos already have birds/water sounds
    const cloudinaryVideo = await fetchOneVideoFromCloudinary();
    if (cloudinaryVideo) {
      postedKeyword = cloudinaryVideo.keyword;
      console.log(`☁️ Using video from Cloudinary pool (${cloudinaryVideo.keyword})...`);
      const caption = await generateSmartCaption(cloudinaryVideo.keyword);
      // Smart-matched audio: water video → water sounds, forest → birds, etc.
      const processedVideoPath = await processVideo(cloudinaryVideo.url, randomSong || undefined);
      const uploadRes = await uploadToPublicHost(processedVideoPath);
      if (!uploadRes) throw new Error('Cloudinary upload failed');
      const videoUrl = uploadRes.url;

      const igRes = await withRetry(() => postToInstagramReel(videoUrl, caption), 3, 'Instagram Reel');
      const fbRes = await withRetry(() => postVideoToFacebookPage(videoUrl, caption), 3, 'Facebook Video');

      await Post.create({ title: `Cloudinary Video: ${cloudinaryVideo.keyword}`, description: caption, mediaUrl: videoUrl, mediaType: 'video', platform: 'both', status: 'posted', postedAt: new Date(), igMediaId: igRes.id, fbPostId: fbRes.id });
      await deleteMediaFromCloudinary(cloudinaryVideo.publicId, 'video'); // Delete sourced video
      await deleteMediaFromCloudinary(uploadRes.publicId, 'video'); // Delete temporary processed video
      await Log.create({ message: `🤖 Posted Cloudinary Video: ${cloudinaryVideo.keyword}`, level: 'info' });

      console.log(`
${'═'.repeat(50)}
✅  REEL PUBLISHED SUCCESSFULLY!
📌  Keyword  : ${cloudinaryVideo.keyword}
📸  Instagram: ${igRes?.id || 'N/A'}
📘  Facebook : ${fbRes?.id || 'N/A'}
🔗  URL      : ${videoUrl.substring(0, 60)}...
${'═'.repeat(50)}
`);

      try { 
        const { notifyPostSuccess } = await import('./telegramService'); 
        await notifyPostSuccess({ 
          keyword: cloudinaryVideo.keyword, 
          igId: igRes.id, 
          fbId: fbRes.id, 
          mediaUrl: videoUrl 
        }); 
      } catch (_) {}
      return;
    }

    // --- PRIORITY 2: Cloudinary Image ---
    // ✅ Image has no audio — add a nature song
    const cloudinaryImage = await fetchOneImageFromCloudinary();
    if (cloudinaryImage) {
      postedKeyword = cloudinaryImage.keyword;
      console.log(`📸 Using image from Cloudinary pool (${cloudinaryImage.keyword})...`);
      const caption = await generateSmartCaption(cloudinaryImage.keyword);
      const processedVideoPath = await generateReelFromImage(cloudinaryImage.url, randomSong || undefined, 7); // song added here
      const uploadRes = await uploadToPublicHost(processedVideoPath);
      if (!uploadRes) throw new Error('Cloudinary upload failed');
      const videoUrl = uploadRes.url;

      const igRes = await withRetry(() => postToInstagramReel(videoUrl, caption), 3, 'Instagram Reel');
      const fbRes = await withRetry(() => postVideoToFacebookPage(videoUrl, caption), 3, 'Facebook Video');

      await Post.create({ title: `Cloudinary Image Reel: ${cloudinaryImage.keyword}`, description: caption, mediaUrl: videoUrl, mediaType: 'video', platform: 'both', status: 'posted', postedAt: new Date(), igMediaId: igRes.id, fbPostId: fbRes.id });
      await deleteMediaFromCloudinary(cloudinaryImage.publicId, 'image'); // Delete sourced image
      await deleteMediaFromCloudinary(uploadRes.publicId, 'video'); // Delete temporary processed video
      await Log.create({ message: `🤖 Posted Cloudinary Image Reel: ${cloudinaryImage.keyword}`, level: 'info' });

      console.log(`
${'═'.repeat(50)}
✅  REEL PUBLISHED SUCCESSFULLY!
📌  Keyword  : ${cloudinaryImage.keyword}
📸  Instagram: ${igRes?.id || 'N/A'}
📘  Facebook : ${fbRes?.id || 'N/A'}
🔗  URL      : ${videoUrl.substring(0, 60)}...
${'═'.repeat(50)}
`);

      try { 
        const { notifyPostSuccess } = await import('./telegramService'); 
        await notifyPostSuccess({ 
          keyword: cloudinaryImage.keyword, 
          igId: igRes.id, 
          fbId: fbRes.id, 
          mediaUrl: videoUrl 
        }); 
      } catch (_) {}
      return;
    }

    // --- PRIORITY 3: External Sourcing (Pexels/Pixabay) ---
    // ✅ Sourced videos keep original audio; sourced images get a nature song
    console.log('🔍 Cloudinary empty. Falling back to External Sourcing...');
    postedKeyword = randomKeyword;
    const autoCaption = await generateSmartCaption(randomKeyword);

    let sourcedVideos = await fetchVideos(randomKeyword, 1);
    if (sourcedVideos.length === 0) sourcedVideos = await fetchVideos('nature', 1);

    if (sourcedVideos.length > 0) {
      const videoMedia = sourcedVideos[0];
      // Smart-matched audio: replaces generic stock video audio with contextual nature sound
      const processedVideoPath = await processVideo(videoMedia.url, randomSong || undefined);
      const uploadRes = await uploadToPublicHost(processedVideoPath);
      if (!uploadRes) throw new Error('Cloudinary upload failed');
      const videoUrl = uploadRes.url;

      const igRes = await withRetry(() => postToInstagramReel(videoUrl, autoCaption), 3, 'Instagram Reel');
      const fbRes = await withRetry(() => postVideoToFacebookPage(videoUrl, autoCaption), 3, 'Facebook Video');

      await Post.create({ title: `Sourced Reel [${randomKeyword}]`, description: autoCaption, mediaUrl: videoUrl, mediaType: 'video', platform: 'both', status: 'posted', postedAt: new Date(), igMediaId: igRes.id, fbPostId: fbRes.id });
      await deleteMediaFromCloudinary(uploadRes.publicId, 'video'); // Delete temporary processed video
      await Log.create({ message: `🤖 Sourced & Posted Video: ${randomKeyword}`, level: 'info' });

      console.log(`
${'═'.repeat(50)}
✅  REEL PUBLISHED SUCCESSFULLY!
📌  Keyword  : ${randomKeyword}
📸  Instagram: ${igRes?.id || 'N/A'}
📘  Facebook : ${fbRes?.id || 'N/A'}
🔗  URL      : ${videoUrl.substring(0, 60)}...
${'═'.repeat(50)}
`);
    } else {
      // Last resort: Sourced Image
      const sourcedImages = await fetchImages(randomKeyword, 1);
      if (sourcedImages.length > 0) {
        const imageMedia = sourcedImages[0];
        const processedVideoPath = await generateReelFromImage(imageMedia.url, randomSong || undefined, 7); // song added here
        const uploadRes = await uploadToPublicHost(processedVideoPath);
        if (!uploadRes) throw new Error('Cloudinary upload failed');
        const videoUrl = uploadRes.url;

        const igRes = await withRetry(() => postToInstagramReel(videoUrl, autoCaption), 3, 'Instagram Reel');
        const fbRes = await withRetry(() => postVideoToFacebookPage(videoUrl, autoCaption), 3, 'Facebook Video');

        await Post.create({ title: `Sourced Image Reel [${randomKeyword}]`, description: autoCaption, mediaUrl: videoUrl, mediaType: 'video', platform: 'both', status: 'posted', postedAt: new Date(), igMediaId: igRes.id, fbPostId: fbRes.id });
        await deleteMediaFromCloudinary(uploadRes.publicId, 'video'); // Delete temporary processed video
        await Log.create({ message: `🤖 Sourced & Posted Image Reel: ${randomKeyword}`, level: 'info' });

        console.log(`
${'═'.repeat(50)}
✅  REEL PUBLISHED SUCCESSFULLY!
📌  Keyword  : ${randomKeyword}
📸  Instagram: ${igRes?.id || 'N/A'}
📘  Facebook : ${fbRes?.id || 'N/A'}
🔗  URL      : ${videoUrl.substring(0, 60)}...
${'═'.repeat(50)}
`);
      }
    }

    try { 
      const { notifyPostSuccess } = await import('./telegramService'); 
      if (postedKeyword) {
        // Find the last IDs from variables in scope or state
        // For external sourced posts
        await notifyPostSuccess({ 
          keyword: postedKeyword,
          mediaUrl: 'Sourced Media'
        }); 
      }
    } catch (_) {}

  } catch (error: any) {
    console.error('🤖 Auto-Pilot Error:', error);
    await Log.create({ message: `🤖 Auto-Pilot Failed: ${error.message}`, level: 'error' });

    // Telegram failure notification
    try { const { notifyPostFailure } = await import('./telegramService'); await notifyPostFailure(error.message); } catch (_) {}
  } finally {
    isAutoPilotRunning = false;
  }
};

// ─── SCHEDULER INIT ──────────────────────────────────────────────────────────
export const initScheduler = () => {
  console.log('⏰ Scheduler Initialized: Running every hour...');

  // Run once immediately on startup
  nextRunTime = new Date(); // Right now
  runAutoPilot().catch(err => console.error('Initial Auto-Pilot failed:', err));

  // Every Minute: Fire manual scheduled posts
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const pendingPosts = await Post.find({ status: 'scheduled', scheduledAt: { $lte: now } });
    for (const post of pendingPosts) {
      try {
        if (post.mediaType === 'video') {
          await withRetry(() => postToInstagramReel(post.mediaUrl, post.description), 3, 'Scheduled IG Reel');
        } else {
          await withRetry(() => postToInstagramImage(post.mediaUrl, post.description), 3, 'Scheduled IG Image');
          await withRetry(() => postToFacebookPage(post.mediaUrl, post.description), 3, 'Scheduled FB Post');
        }
        post.status = 'posted'; post.postedAt = new Date(); await post.save();
        await Log.create({ message: `Auto-posted scheduled post ${post._id}`, level: 'info' });
      } catch (error: any) {
        post.status = 'failed'; post.error = error.message; await post.save();
        await Log.create({ message: `Auto-post failed: ${error.message}`, level: 'error' });
      }
    }
  });

  // Every Hour: Full Auto-Pilot with random delay
  cron.schedule('0 * * * *', async () => {
    const delayMs = Math.floor(Math.random() * 15 * 60 * 1000);
    nextRunTime = new Date(Date.now() + delayMs);
    console.log(`🎲 Auto-Pilot scheduled for: ${nextRunTime.toLocaleTimeString('en-IN')}`);
    setTimeout(() => runAutoPilot(), delayMs);
  });
};
