import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('Connecting to MongoDB failed');

    throw new Error('MONGODB_URI environment variable is not defined');
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}