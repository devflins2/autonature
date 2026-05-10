import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  platform: 'instagram' | 'facebook' | 'both';
  status: 'pending' | 'scheduled' | 'posted' | 'failed';
  scheduledAt?: Date;
  postedAt?: Date;
  error?: string;
  igMediaId?: string;
  fbPostId?: string;
  insights?: {
    reach: number;
    impressions: number;
    video_views: number;
    saved: number;
  };
}


const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  platform: { type: String, enum: ['instagram', 'facebook', 'both'], default: 'both' },
  status: { type: String, enum: ['pending', 'scheduled', 'posted', 'failed'], default: 'pending' },
  scheduledAt: { type: Date },
  postedAt: { type: Date },
  error: { type: String },
  igMediaId: { type: String },
  fbPostId: { type: String },
  insights: {
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    video_views: { type: Number, default: 0 },
    saved: { type: Number, default: 0 }
  }
}, { timestamps: true });


export default mongoose.model<IPost>('Post', PostSchema);
