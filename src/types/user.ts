// src/types/user.ts
import type { ObjectId } from 'mongodb';

export interface User {
  id: string;
  name?: string;
  email: string;
  // Password should not be part of the client-facing User type
  // It's only used during registration and login backend logic
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

// For backend MongoDB document, including hashed password
export interface UserDocument {
  _id?: ObjectId; // MongoDB ObjectId
  name?: string;
  email: string;
  hashedPassword?: string; // Store hashed password, not plain text
  createdAt: Date;
  updatedAt: Date;
}

// For user registration from the client
export interface NewUser {
  name: string;
  email: string;
  password: string;
}
