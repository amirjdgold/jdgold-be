import mongoose from 'mongoose';

/**
 * Connect to MongoDB using MONGODB_URI from the environment.
 * Never hardcodes credentials or connection strings.
 * On failure, logs and rethrows so the process can exit gracefully.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    const err = new Error(
      'MONGODB_URI is not set. Copy .env.example to .env and set MONGODB_URI.'
    );
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(
      `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message || err);
    throw err;
  }
}

export default connectDB;
