// src/app/login/page.tsx
"use client";

import { useState, type FormEvent } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import { useAuthMock } from '@/hooks/useAuthMock';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading: isAuthLoading } = useAuthMock(); // Renamed isLoading to isAuthLoading
  const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state for the form
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        // Navigation is handled by the login function in useAuthMock
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) { // Using isAuthLoading from the hook for initial auth check
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <p>Loading authentication status...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Organizer Login</CardTitle>
            <CardDescription>Access your tournament dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="organizer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || isAuthLoading}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center block">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
