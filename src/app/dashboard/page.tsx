// src/app/dashboard/page.tsx
"use client";

import TournamentCard from '@/components/cards/TournamentCard';
import { Button } from '@/components/ui/button';
import { useTournaments } from '@/hooks/useTournaments';
import type { Tournament } from '@/types/tournament';
import { PlusCircle, Swords } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useAuthMock } from '@/hooks/useAuthMock'; // Import useAuthMock

export default function DashboardPage() {
  const { tournaments, isLoadingTournaments, updateTournamentStatus, errorLoadingTournaments, refreshTournaments } = useTournaments();
  const { currentUserEmail, isLoggedIn } = useAuthMock(); // Get current user's email and login status

  useEffect(() => {
    if (isLoggedIn && currentUserEmail) { // Only fetch if logged in and email is available
      refreshTournaments(currentUserEmail); 
    } else if (isLoggedIn === false) { // If not logged in (explicitly false, not undefined)
        // Handled by DashboardLayout, but as a fallback, clear local tournament list
        // Or redirect, though layout should handle it.
    }
  }, [refreshTournaments, currentUserEmail, isLoggedIn]);

  const upcomingTournaments = tournaments.filter(t => t.status === 'Upcoming');
  const activeTournaments = tournaments.filter(t => t.status === 'Active');
  const completedTournaments = tournaments.filter(t => t.status === 'Completed');
  const cancelledTournaments = tournaments.filter(t => t.status === 'Cancelled');

  const renderTournamentList = (list: Tournament[], title: string) => (
    <>
      {list.length === 0 ? (
        <p className="text-muted-foreground mt-4">No {title.toLowerCase()} tournaments found for you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {list.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} onUpdateStatus={updateTournamentStatus} />
          ))}
        </div>
      )}
    </>
  );
  
  if (isLoadingTournaments && tournaments.length === 0) { 
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div>
          <Skeleton className="h-10 w-full sm:w-1/2 md:w-1/3 mb-4" /> 
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  if (errorLoadingTournaments) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Your Tournaments</h1>
        <p className="text-muted-foreground">{errorLoadingTournaments}</p>
        <Button onClick={() => currentUserEmail && refreshTournaments(currentUserEmail)}>Try Again</Button>
      </div>
    )
  }


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
          <Swords className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-primary" />
          Your Tournament Dashboard
        </h1>
        <Button asChild size="lg">
          <Link href="/dashboard/tournaments/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Tournament
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTournaments.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledTournaments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {isLoadingTournaments && upcomingTournaments.length === 0 ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">{[1,2].map(i => <Skeleton key={i} className="h-96 w-full" />)}</div> : renderTournamentList(upcomingTournaments, "Upcoming")}
        </TabsContent>
        <TabsContent value="active">
          {isLoadingTournaments && activeTournaments.length === 0 ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">{[1,2].map(i => <Skeleton key={i} className="h-96 w-full" />)}</div> : renderTournamentList(activeTournaments, "Active")}
        </TabsContent>
        <TabsContent value="completed">
          {isLoadingTournaments && completedTournaments.length === 0 ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">{[1,2].map(i => <Skeleton key={i} className="h-96 w-full" />)}</div> : renderTournamentList(completedTournaments, "Completed")}
        </TabsContent>
         <TabsContent value="cancelled">
          {isLoadingTournaments && cancelledTournaments.length === 0 ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">{[1,2].map(i => <Skeleton key={i} className="h-96 w-full" />)}</div> : renderTournamentList(cancelledTournaments, "Cancelled")}
        </TabsContent>
      </Tabs>

      {tournaments.length === 0 && !isLoadingTournaments && !errorLoadingTournaments && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">You haven&apos;t created any tournaments yet.</p>
          <Button asChild>
            <Link href="/dashboard/tournaments/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Tournament
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
