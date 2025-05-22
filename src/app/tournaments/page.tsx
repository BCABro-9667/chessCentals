
// src/app/tournaments/page.tsx
"use client";

import { useEffect } from 'react'; // Added useEffect
import Header from '@/components/layout/Header';
import TournamentCard from '@/components/cards/TournamentCard';
import { useTournaments } from '@/hooks/useTournaments';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AllTournamentsPage() {
  const { tournaments, isLoadingTournaments, fetchTournaments } = useTournaments();

  useEffect(() => {
    fetchTournaments(); // Fetch all tournaments for public display
  }, [fetchTournaments]);

  // Sort tournaments: upcoming first, then active, then completed, then cancelled
  // Within upcoming/active, sort by start date (earliest first)
  // Within completed, sort by end date (latest first)
  const sortedTournaments = [...tournaments].sort((a, b) => {
    const statusOrder = { 'Upcoming': 1, 'Active': 2, 'Completed': 3, 'Cancelled': 4 };
    
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }

    if (a.status === 'Upcoming' || a.status === 'Active') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (a.status === 'Completed') {
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
    // For cancelled or other, maintain original relative order or sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Header />
      <main className="flex-grow bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
              All Tournaments
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Browse our full list of chess competitions. Click on any tournament to view details and register.
            </p>
          </div>

          {isLoadingTournaments && sortedTournaments.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!isLoadingTournaments && sortedTournaments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-2xl text-muted-foreground mb-6">No tournaments found at the moment.</p>
              <Button asChild size="lg">
                <Link href="/dashboard/tournaments/create">Organizers: Create a Tournament</Link>
              </Button>
            </div>
          )}

          {!isLoadingTournaments && sortedTournaments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {sortedTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="py-8 bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Chessmate Central. All rights reserved.
        </div>
      </footer>
    </>
  );
}
