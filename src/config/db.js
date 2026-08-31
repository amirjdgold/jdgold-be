import mongoose from 'mongoose';

const connectionCache =
  globalThis.__jdgMongooseConnection ||
  (globalThis.__jdgMongooseConnection = { promise: null });

/**
 * Connect to MongoDB using MONGODB_URI from the environment.
 * Never hardcodes credentials or connection strings.
 * Cached for Vercel serverless warm starts.
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

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 0) {
    connectionCache.promise = null;
  }

  if (!connectionCache.promise) {
    connectionCache.promise = mongoose
      .connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 })
      .then((conn) => {
        console.log(
          `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
        );
        return conn;
      })
      .catch((err) => {
        connectionCache.promise = null;
        console.error('MongoDB connection failed:', err.message || err);
        throw err;
      });
  }

  return connectionCache.promise;
}

export default connectDB;
