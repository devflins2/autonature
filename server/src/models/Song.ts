import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
  name: string;
  artist?: string;
  url: string; // URL to the MP3 file
  localPath?: string;
}

const SongSchema: Schema = new Schema({
  name: { type: String, required: true },
  artist: { type: String },
  url: { type: String, required: true },
  localPath: { type: String },
  lastUsedAt: { type: Date }
}, { timestamps: true });


export default mongoose.model<ISong>('Song', SongSchema);
