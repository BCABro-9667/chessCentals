// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import type { UserDocument } from '@/types/user';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email });

    if (!user || !user.hashedPassword) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // In a real app, you would generate a JWT or session token here
    // For this mock, we just confirm success. The client will manage its 'isLoggedIn' state.
    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Error logging in', error: (error as Error).message }, { status: 500 });
  }
}
