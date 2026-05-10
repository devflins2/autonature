import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  message: string;
  level: 'info' | 'warn' | 'error';
  metadata?: any;
}

const LogSchema: Schema = new Schema({
  message: { type: String, required: true },
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model<ILog>('Log', LogSchema);
