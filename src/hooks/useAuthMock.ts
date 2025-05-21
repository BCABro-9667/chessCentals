// src/hooks/useAuthMock.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { NewUser } from '@/types/user';

const AUTH_KEY = 'isLoggedInChessmate';

export function useAuthMock() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false); // For API call loading state
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    const authStatus = storedAuth === 'true';
    setIsLoggedIn(authStatus);

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
        setIsLoggedIn(true);
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
    // For now, it's primarily client-side for this mock setup
    // try {
    //   await fetch('/api/auth/logout', { method: 'POST' });
    // } catch (error) {
    //   console.error("Logout API call failed:", error);
    // }
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    router.push('/login');
  }, [router]);

  return { 
    isLoggedIn, 
    login, 
    logout, 
    registerUser, 
    isLoading: isLoading || isLoggedIn === undefined // isLoading is true if API call is in progress OR initial auth check is pending
  };
}
