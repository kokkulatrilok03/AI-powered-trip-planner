import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

// Some networks block SRV lookups on the default resolver.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});
