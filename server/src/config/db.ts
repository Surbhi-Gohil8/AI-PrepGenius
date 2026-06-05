import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

// Force load from the local .env file regardless of any inherited shell/Docker env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':***@')}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};
