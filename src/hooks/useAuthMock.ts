// src/hooks/useAuthMock.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { NewUser } from '@/types/user';

const AUTH_KEY = 'isLoggedInChessmate';
const USER_EMAIL_KEY = 'currentUserEmailChessmate'; // Key for storing user email

export function useAuthMock() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    const authStatus = storedAuth === 'true';
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
    
    setIsLoggedIn(authStatus);
    setCurrentUserEmail(authStatus ? storedEmail : null);

    if (pathname?.startsWith('/dashboard') && !authStatus && isLoggedIn === false) {
      router.replace('/login');
    }
  }, [router, pathname, isLoggedIn]);


  const registerUser = useCallback(async (userData: NewUser): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Registration failed' };
      }
      return { success: true, message: result.message || 'Registration successful! Please log in.' };
    } catch (error) {
      return { success: false, message: (error as Error).message || 'An unexpected error occurred.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(USER_EMAIL_KEY, email); // Store email on login
        setIsLoggedIn(true);
        setCurrentUserEmail(email); // Set email in state
        router.push('/dashboard');
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Login failed.' };
      }
    } catch (error) {
      return { success: false, message: (error as Error).message || 'An unexpected error occurred.' };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    // Optional: Call a backend logout endpoint if it does server-side session invalidation
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_EMAIL_KEY); // Clear email on logout
    setIsLoggedIn(false);
    setCurrentUserEmail(null); // Clear email from state
    router.push('/login');
  }, [router]);

  return { 
    isLoggedIn, 
    currentUserEmail, // Expose current user's email
    login, 
    logout, 
    registerUser, 
    isLoading: isLoading || isLoggedIn === undefined 
  };
}
