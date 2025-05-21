// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion, Db, Collection, Document } from 'mongodb';
import type { Tournament } from '@/types/tournament';
import type { PlayerRegistration } from '@/types/playerRegistration';
import type { TournamentResult } from '@/types/tournamentResult';
import type { BlogPost } from '@/types/blog';
import type { UserDocument } from '@/types/user'; // Import the UserDocument type

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local or your deployment environment.');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }
  try {
    await client.connect();
    const dbNameFromUri = new URL(uri.startsWith('mongodb+srv') ? uri.replace('mongodb+srv','mongodb') : uri).pathname.substring(1);
    db = client.db(dbNameFromUri || 'blog'); // Fallback to 'blog' if not in URI path
    console.log(`Successfully connected to MongoDB and database: ${db.databaseName}`);
    return db;
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    throw e;
  }
}

export async function getTournamentsCollection(): Promise<Collection<Tournament>> {
  const database = await connectToDatabase();
  return database.collection<Tournament>('tournaments');
}

export async function getPlayerRegistrationsCollection(): Promise<Collection<PlayerRegistration>> {
  const database = await connectToDatabase();
  return database.collection<Document & Omit<PlayerRegistration, 'id'>>('playerRegistrations') as Collection<PlayerRegistration>;
}

export async function getTournamentResultsCollection(): Promise<Collection<TournamentResult>> {
  const database = await connectToDatabase();
  return database.collection<Document & TournamentResult>('tournamentResults') as Collection<TournamentResult>;
}

export async function getBlogPostsCollection(): Promise<Collection<BlogPost>> {
  const database = await connectToDatabase();
  return database.collection<Document & Omit<BlogPost, 'id'>>('blogPosts') as Collection<BlogPost>;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const database = await connectToDatabase();
  return database.collection<UserDocument>('users');
}
