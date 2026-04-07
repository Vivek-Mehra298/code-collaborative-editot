import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri, isProduction } from './config';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = getMongoUri();
    await mongoose.connect(mongoURI);
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
