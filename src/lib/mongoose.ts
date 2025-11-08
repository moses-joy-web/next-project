import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Post } from '@/models/Post';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/socialx';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var _mongoosePromise: any;
  var _mongooseSeeded: boolean | undefined;
}

async function seedDatabaseOnce() {
  if (global._mongooseSeeded) return;
  try {
    console.log('[mongoose] Running seedDatabaseOnce');
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    if (userCount === 0 && postCount === 0) {
      // create two users and a sample post
      // NOTE: these are development seed users. Passwords are set to 'dev' but
      // passwordHash is a plain string here in the original seed. For correct
      // bcrypt comparisons, use the signup flow to create users or update the
      // seed to store bcrypt-hashed passwords.
      const alice = await User.create({ username: 'alice', name: 'Alice', passwordHash: 'dev' });
      const bob = await User.create({ username: 'bob', name: 'Bob', passwordHash: 'dev' });
      await Post.create({ author: alice._id, text: 'Welcome to SocialX! This is a default post.', imageUrl: undefined, repostOf: null });
      await Post.create({ author: bob._id, text: 'Another sample post from Bob.', imageUrl: undefined, repostOf: null });
      console.log('[mongoose] Seeded database with default users and posts');
    }
  } catch (e) {
    // ignore seeding errors in CI/dev environments
    console.warn('[mongoose] Seeding error', e);
  }
  global._mongooseSeeded = true;
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return mongoose;

  // In development, reuse connection to avoid Model compilation issues
  if (process.env.NODE_ENV === 'development' && global._mongoosePromise) {
    await global._mongoosePromise;
    // ensure seeding ran
    await seedDatabaseOnce();
    return mongoose;
  }

  console.log('[mongoose] Connecting to MongoDB', MONGODB_URI);
  const p = mongoose.connect(MONGODB_URI).catch(err => {
    console.error('[mongoose] Connection error', err);
    throw err;
  });
  if (process.env.NODE_ENV === 'development') global._mongoosePromise = p;
  await p;
  // seed default content if needed
  await seedDatabaseOnce();
  console.log('[mongoose] Connected to MongoDB');
  return mongoose;
}

export default mongoose;
