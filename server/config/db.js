const mongoose = require('mongoose');

const MAX_RETRIES = parseInt(process.env.MONGODB_RETRY_ATTEMPTS, 10) || 5;
const RETRY_DELAY_MS = parseInt(process.env.MONGODB_RETRY_DELAY_MS, 10) || 2000;

let isConnected = false;

const getMongoOptions = () => ({
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 45000,
});

const getConnectionUris = () => {
  const uris = [];
  if (process.env.MONGODB_URI) uris.push(process.env.MONGODB_URI);

  // In development, try a local MongoDB URI if no production URI is available.
  if (process.env.NODE_ENV !== 'production') {
    const local =
      process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/void_taskmanager';
    if (!uris.includes(local)) uris.push(local);
  }
  return uris;
};

const tryConnect = async (uri) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  const conn = await mongoose.connect(uri, getMongoOptions());
  isConnected = true;
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  console.log(`📦 Database: ${conn.connection.name}`);
  return true;
};

const connectDB = async () => {
  const uris = getConnectionUris();
  if (uris.length === 0) {
    console.error('❌ MONGODB_URI is not set.');
    if (process.env.NODE_ENV === 'production') process.exit(1);
    return false;
  }

  for (const uri of uris) {
    const label = uri.includes('127.0.0.1') || uri.includes('localhost') ? 'local' : 'atlas';
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await tryConnect(uri);
        if (label === 'local' && uris[0] !== uri) {
          console.log('ℹ️  Using local MongoDB (Atlas unreachable). Set MONGODB_URI when online.');
        }
        return true;
      } catch (error) {
        isConnected = false;
        console.error(
          `❌ MongoDB [${label}] attempt ${attempt}/${MAX_RETRIES}: ${error.message}`
        );
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }
  }

  console.error('💡 Atlas: whitelist IP at cloud.mongodb.com → Network Access');
  console.error('💡 Local: ensure MongoDB service is running on port 27017');
  if (process.env.NODE_ENV === 'production') process.exit(1);
  return false;
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected.');
});

const isDbReady = () =>
  isConnected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isDbReady };
