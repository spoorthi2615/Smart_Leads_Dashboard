import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  console.log('[Backend] MONGO_URI loaded from validated env');

  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: 'smart_leads',
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}
