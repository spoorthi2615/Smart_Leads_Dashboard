import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const envMongoUri = process.env.MONGO_URI;
  const mongoUri = envMongoUri ?? 'mongodb://127.0.0.1:27017/smart_leads';

  console.log(`[Backend] MONGO_URI ${envMongoUri ? 'loaded from env' : 'not found in env'}`);
  if (!envMongoUri) {
    console.warn('MONGO_URI not provided. Falling back to local MongoDB at mongodb://127.0.0.1:27017/smart_leads');
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: 'smart_leads',
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}
