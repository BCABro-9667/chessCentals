// src/hooks/useAuthMock.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AUTH_KEY = 'isLoggedInChessmate';
const USERS_KEY = 'chessmate_users'; // Key for storing registered users

// Define a simple user type for our mock
interface MockUser {
  name?: string; // Optional, if collected during registration
  email: string;
  password: string; // In a real app, this would be hashed
}

export function useAuthMock() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    const authStatus = storedAuth === 'true';
    setIsLoggedIn(authStatus);

    // Redirect if trying to access dashboard while not logged in
    // This part remains the same, but login status is now more rigorously checked
    if (pathname?.startsWith('/dashboard') && !authStatus && isLoggedIn === false) { // check isLoggedIn explicitly false to avoid redirect on initial undefined
      router.replace('/login');
    }
  }, [router, pathname, isLoggedIn]);

  const getRegisteredUsers = (): MockUser[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveRegisteredUsers = (users: MockUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const registerUser = useCallback(async (userData: MockUser): Promise<{ success: boolean; message: string }> => {
    const users = getRegisteredUsers();
    const existingUser = users.find(user => user.email === userData.email);

    if (existingUser) {
      return { success: false, message: 'Email already registered.' };
    }

    users.push(userData);
    saveRegisteredUsers(users);
    return { success: true, message: 'Registration successful! Please log in.' };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const users = getRegisteredUsers();
    const user = users.find(u => u.email === email);

    if (user && user.password === password) { // Simple password check
      localStorage.setItem(AUTH_KEY, 'true');
      setIsLoggedIn(true);
      router.push('/dashboard');
      return { success: true };
    } else {
      return { success: false, message: 'Invalid email or password.' };
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    router.push('/login');
  }, [router]);

  return { 
    isLoggedIn, 
    login, 
    logout, 
    registerUser, 
    isLoading: isLoggedIn === undefined 
  };
}
