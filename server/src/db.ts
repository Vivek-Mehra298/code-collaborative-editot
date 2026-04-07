import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri, isProduction } from './config';

dotenv.config();
mongoose.set('bufferCommands', false);

export const isDatabaseReady = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    const mongoURI = getMongoUri();
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);

    if (isProduction) {
      process.exit(1);
    }

    console.warn('Continuing without MongoDB in development. Set MONGO_URI or start a local MongoDB instance.');
  }
};

export default connectDB;
