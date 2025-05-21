// src/app/dashboard/tournaments/[id]/results/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTournaments } from '@/hooks/useTournaments';
import { usePlayerRegistrations } from '@/hooks/usePlayerRegistrations';
import { useTournamentResults } from '@/hooks/useTournamentResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tournament } from '@/types/tournament';
import type { PlayerRegistration } from '@/types/playerRegistration';
import type { PlayerScore } from '@/types/tournamentResult';
import { useToast } from '@/hooks/use-toast';

const scoreOptions = [
  { label: 'Win (1)', value: '1' },
  { label: 'Draw (0.5)', value: '0.5' },
  { label: 'Loss (0)', value: '0' },
  { label: 'Not Played (-)', value: 'null' },
];

export default function ManageResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { toast } = useToast();

  const { getTournamentById, isLoadingTournaments: isLoadingTournamentDetails } = useTournaments();
  const { 
    getRegistrationsByTournamentId: getLocalRegistrations, 
    fetchRegistrationsByTournamentId, 
    isLoadingRegistrations,
    errorRegistrations
  } = usePlayerRegistrations();
  
  const { 
    isLoadingResults: isLoadingSavedResults, 
    currentTournamentResult,
    fetchResultsForTournament,
    initializeOrUpdateTournamentResults, 
    updatePlayerRoundScore,
    errorResults
  } = useTournamentResults();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const registeredPlayers = getLocalRegistrations(tournamentId); 
  const playerScores = currentTournamentResult?.playerScores || [];
  
  useEffect(() => {
    if (tournamentId && !isLoadingTournamentDetails) {
      const fetchedTournament = getTournamentById(tournamentId);
      setTournament(fetchedTournament);
    }
  }, [isLoadingTournamentDetails, tournamentId, getTournamentById]);

  useEffect(() => {
    if (tournamentId) {
      fetchRegistrationsByTournamentId(tournamentId);
      fetchResultsForTournament(tournamentId);
    }
  }, [tournamentId, fetchRegistrationsByTournamentId, fetchResultsForTournament]);
  
  useEffect(() => {
    if (tournament && !isLoadingRegistrations && tournament.totalRounds && tournament.totalRounds > 0) {
      initializeOrUpdateTournamentResults(tournament.id, registeredPlayers, tournament.totalRounds);
    }
  }, [
    tournament, 
    registeredPlayers, 
    isLoadingRegistrations, 
    initializeOrUpdateTournamentResults 
  ]);


  const handleScoreChange = (playerId: string, roundIndex: number, value: string) => {
    if (!tournament) return;
    const newScore = value === 'null' ? null : parseFloat(value);
    updatePlayerRoundScore(tournament.id, playerId, roundIndex, newScore);
  };
  
  const totalRounds = tournament?.totalRounds || 0;

  if (isLoadingTournamentDetails || tournament === undefined || (isLoadingRegistrations && registeredPlayers.length ===0) ) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Card className="max-w-6xl mx-auto w-full">
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Skeleton className="h-12 w-full mb-2" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full mb-1" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tournament === null) {
    notFound();
  }

  if (errorRegistrations || errorResults) {
     return (
      <div className="space-y-6 text-center text-destructive">
        <h1 className="text-2xl font-bold">Error Loading Data</h1>
        {errorRegistrations && <p>Registrations Error: {errorRegistrations}</p>}
        {errorResults && <p>Results Error: {errorResults}</p>}
         <Button asChild variant="outline">
          <Link href={`/dashboard`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }
  
  if (tournament && tournament.status === 'Cancelled') {
     return (
      <div className="space-y-6 text-center">
        <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Results Not Applicable</h1>
        <p className="text-muted-foreground">
          This tournament has been cancelled. Results cannot be managed.
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }
  
  if (totalRounds === 0) {
    return (
       <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <ClipboardList className="w-8 h-8 mr-3 text-primary" />
            Manage Results: {tournament?.name}
          </h1>
          <Button variant="outline" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
        <Card className="max-w-6xl mx-auto w-full">
            <CardHeader>
                <CardTitle>No Rounds Defined</CardTitle>
                <CardDescription>
                    This tournament has 0 rounds specified. Please edit the tournament to add total rounds to manage results.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <ClipboardList className="w-8 h-8 mr-3 text-primary" />
          Manage Results: {tournament?.name}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>

      <Card className="max-w-6xl mx-auto w-full"> {/* Added max-width and centering */}
        <CardHeader>
          <CardTitle>Enter Scores {isLoadingSavedResults && <Loader2 className="inline w-5 h-5 animate-spin ml-2" />}</CardTitle>
          <CardDescription>
            Update scores for each player per round. Total rounds: {totalRounds}.
            Changes are saved automatically to the backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRegistrations && registeredPlayers.length === 0 && !errorRegistrations ? (
             <div className="space-y-2"><p>Loading registered players...</p>{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !isLoadingRegistrations && registeredPlayers.length === 0 && !errorRegistrations ? (
            <p className="text-muted-foreground text-center py-8">No players registered for this tournament yet. Register players first to manage results.</p>
          ) : playerScores.length === 0 && !isLoadingSavedResults && totalRounds > 0 && registeredPlayers.length > 0 && !errorResults ? ( 
             <p className="text-muted-foreground text-center py-8">Initializing results table... If this persists, ensure the tournament has rounds defined and players are registered. Results are being fetched or created.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10 min-w-[150px] md:min-w-[200px]">Player</TableHead>
                    {[...Array(totalRounds)].map((_, i) => (
                      <TableHead key={`round-header-${i + 1}`} className="text-center min-w-[120px]">R{i + 1}</TableHead>
                    ))}
                    <TableHead className="text-center font-semibold min-w-[80px]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerScores.map((ps) => {
                    const playerReg = registeredPlayers.find(p => p.id === ps.playerId); 
                    return (
                      <TableRow key={ps.playerId}>
                        <TableCell className="font-medium sticky left-0 bg-card z-10">
                          {playerReg?.playerName || ps.playerName || 'Unknown Player'}
                          {playerReg?.fideRating && playerReg.fideRating > 0 ? (
                            <span className="text-xs text-muted-foreground ml-1">({playerReg.fideRating})</span>
                          ) : ps.fideRating && ps.fideRating > 0 ? (
                             <span className="text-xs text-muted-foreground ml-1">({ps.fideRating})</span>
                          ) : null}
                        </TableCell>
                        {ps.roundScores && ps.roundScores.length === totalRounds ? ps.roundScores.map((score, roundIdx) => (
                          <TableCell key={`score-${ps.playerId}-${roundIdx}`} className="text-center">
                            <Select
                              value={score === null ? 'null' : String(score)}
                              onValueChange={(value) => handleScoreChange(ps.playerId, roundIdx, value)}
                              disabled={tournament?.status === 'Completed' || tournament?.status === 'Cancelled' || isLoadingSavedResults}
                            >
                              <SelectTrigger className="w-[100px] h-9 mx-auto">
                                <SelectValue placeholder="Score" />
                              </SelectTrigger>
                              <SelectContent>
                                {scoreOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )) : (
                          [...Array(totalRounds)].map((_, roundIdx) => (
                            <TableCell key={`empty-score-${ps.playerId}-${roundIdx}`} className="text-center">
                              <Select disabled>
                                <SelectTrigger className="w-[100px] h-9 mx-auto">
                                  <SelectValue placeholder="N/A" />
                                </SelectTrigger>
                              </Select>
                            </TableCell>
                          ))
                        )}
                        <TableCell className="text-center font-bold">{ps.totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
