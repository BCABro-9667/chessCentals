
// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Crown, LogIn, LogOut, LayoutDashboard, Sun, Moon, NewspaperIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthMock } from '@/hooks/useAuthMock';
import { useTheme } from '@/hooks/useTheme';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export default function Header() {
  const { isLoggedIn, logout, isLoading: isLoadingAuth } = useAuthMock();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const pathname = usePathname();

  const isDashboardRoute = pathname?.startsWith('/dashboard');

  const navLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/tournaments", label: "Tournaments", icon: null },
    { href: "/blog", label: "Blog", icon: NewspaperIcon },
  ];

  const dashboardLink = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <Crown className="w-8 h-8" />
          <span className="text-xl sm:text-2xl font-bold">Chessmate Central</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Button variant="ghost" asChild key={link.href}>
                <Link href={link.href}>
                  {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                  {link.label}
                </Link>
              </Button>
            ))}
            {isLoggedIn && !isDashboardRoute && (
              <Button variant="ghost" asChild>
                <Link href={dashboardLink.href}>
                  {dashboardLink.icon && <dashboardLink.icon className="mr-2 h-4 w-4" />}
                  {dashboardLink.label}
                </Link>
              </Button>
            )}
          </div>

          {/* Theme Toggle and Auth Buttons - Always visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isLoadingAuth ? (
            <Button variant="ghost" disabled>Loading...</Button>
          ) : isLoggedIn ? (
            <Button variant="outline" onClick={logout} size="sm">
              <LogOut className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
          )}

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle asChild>
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
                        <Crown className="w-7 h-7" />
                        <span className="text-xl font-bold">Chessmate Central</span>
                      </Link>
                    </SheetClose>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-grow p-4">
                  <ul className="flex flex-col gap-2">
                    {navLinks.map(link => (
                      <li key={`mobile-${link.href}`}>
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            className="flex items-center p-3 hover:bg-accent rounded-md text-base font-medium"
                          >
                            {link.icon && <link.icon className="mr-3 h-5 w-5 text-muted-foreground" />}
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                    {isLoggedIn && ( // Show dashboard link in mobile menu if logged in
                      <li>
                        <SheetClose asChild>
                          <Link
                            href={dashboardLink.href}
                            className="flex items-center p-3 hover:bg-accent rounded-md text-base font-medium"
                          >
                            {dashboardLink.icon && <dashboardLink.icon className="mr-3 h-5 w-5 text-muted-foreground" />}
                            {dashboardLink.label}
                          </Link>
                        </SheetClose>
                      </li>
                    )}
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
