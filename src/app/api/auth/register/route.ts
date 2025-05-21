// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import type { NewUser, UserDocument } from '@/types/user';

export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as NewUser;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 }); // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    const newUserDocument: Omit<UserDocument, '_id'> = {
      name,
      email,
      hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUserDocument as UserDocument);

    if (!result.insertedId) {
      return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Error registering user', error: (error as Error).message }, { status: 500 });
  }
}
