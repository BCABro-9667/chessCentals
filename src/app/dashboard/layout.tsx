// src/app/dashboard/layout.tsx
"use client";

import Header from '@/components/layout/Header';
import DashboardNav from '@/components/layout/DashboardNav';
import { useAuthMock } from '@/hooks/useAuthMock';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger, // The hamburger button
  SidebarContent, // To make nav scrollable within sidebar
  SidebarInset,   // For the main content area
} from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isLoading } = useAuthMock();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || !isLoggedIn) {
    // Skeleton loading state
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-[280px_1fr] gap-8 items-start">
          <aside className="hidden md:block">
            <Skeleton className="h-[calc(100vh_-_theme(spacing.16)_-_2rem_-_1px)] w-full rounded-lg" />
          </aside>
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2 rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    // SidebarProvider manages the state for the sidebar (open/closed, mobile/desktop)
    // defaultOpen={true} will make the desktop sidebar initially expanded.
    // On mobile, it defaults to closed, opened by SidebarTrigger.
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        {/* Flex container for the sidebar and the main content area - removed container mx-auto here */}
        <div className="flex flex-1">
          {/* Sidebar: Renders as a collapsible panel on desktop, and a sheet on mobile. */}
          {/* `collapsible="icon"` enables the icon-only collapsed state on desktop. */}
          {/* `print:hidden` ensures it's not printed. */}
          <Sidebar collapsible="icon" className="border-r print:hidden">
            {/* SidebarContent makes the DashboardNav scrollable if it overflows. */}
            {/* p-0 because DashboardNav likely has its own padding. */}
            <SidebarContent className="p-0">
              <DashboardNav />
            </SidebarContent>
          </Sidebar>

          {/* SidebarInset: Wraps the main page content. It adjusts its margins based on the sidebar state. */}
          <SidebarInset className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile-only trigger bar: Contains the hamburger button. */}
            {/* `md:hidden` makes it visible only on screens smaller than md. */}
            {/* `sticky` and `top-16` (assuming header is approx 4rem/64px high) keeps it at the top. */}
            {/* `z-30` to ensure it's above content but below a potentially higher-z header. */}
            <div className="p-2 border-b md:hidden sticky top-16 bg-background z-30">
              <SidebarTrigger /> {/* This is the hamburger icon button */}
            </div>
            {/* Main content area: Scrollable for both x and y overflow. */}
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
