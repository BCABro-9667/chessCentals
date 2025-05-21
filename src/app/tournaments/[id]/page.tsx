
// src/app/tournaments/[id]/page.tsx
"use client"; 

import Header from '@/components/layout/Header';
import { useTournaments } from '@/hooks/useTournaments';
import { usePlayerRegistrations } from '@/hooks/usePlayerRegistrations';
import { useTournamentResults } from '@/hooks/useTournamentResults';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { CalendarDays, MapPin, Users, DollarSign, Trophy, Clock, Info, ListChecks, BarChart3, UserPlus, Loader2, Eye, ListOrdered, Upload, RadioTower, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlayerRegistration } from '@/types/playerRegistration';
import type { PlayerScore } from '@/types/tournamentResult';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Helper function to compare standings (simplified for this context)
const areStandingsEqual = (s1: PlayerScore[], s2: PlayerScore[]): boolean => {
  if (!s1 && !s2) return true; // Both null/undefined
  if (!s1 || !s2) return false; // One is null/undefined
  if (s1.length !== s2.length) return false;
  for (let i = 0; i < s1.length; i++) {
    // Comparing essential fields that define a standing entry's identity and core data
    if (s1[i].playerId !== s2[i].playerId || 
        s1[i].totalScore !== s2[i].totalScore || 
        s1[i].roundScores.length !== s2[i].roundScores.length) {
      return false;
    }
    for (let j = 0; j < s1[i].roundScores.length; j++) {
      if (s1[i].roundScores[j] !== s2[i].roundScores[j]) return false;
    }
  }
  return true;
};


export default function TournamentDetailsPage() {
  const params = useParams(); 
  const tournamentId = params.id as string; 

  const { getTournamentById, isLoadingTournaments: isLoadingTournamentDetails } = useTournaments();
  const tournament = getTournamentById(tournamentId);
  const { toast } = useToast();

  const { 
    getRegistrationsByTournamentId: getLocalRegistrations, 
    fetchRegistrationsByTournamentId,
    addRegistration, 
    isLoadingRegistrations,
    errorRegistrations
  } = usePlayerRegistrations();
  const registeredPlayers = getLocalRegistrations(tournamentId);


  const { 
    currentTournamentResult,
    fetchResultsForTournament,
    isLoadingResults: isLoadingSavedResults,
    errorResults
  } = useTournamentResults(); 

  const [tournamentStandings, setTournamentStandings] = useState<PlayerScore[]>([]);

  // Form state for public registration
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [dob, setDob] = useState('');
  const [organization, setOrganization] = useState('');
  const [mobile, setMobile] = useState('');
  const [fideRating, setFideRating] = useState<number | ''>(0);
  const [fideId, setFideId] = useState('-');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const publicFileInputRef = useRef<HTMLInputElement>(null);


  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [showRegisteredPlayers, setShowRegisteredPlayers] = useState(true);


  useEffect(() => {
    if (tournamentId) {
      fetchRegistrationsByTournamentId(tournamentId);
      fetchResultsForTournament(tournamentId);
    }
  }, [tournamentId, fetchRegistrationsByTournamentId, fetchResultsForTournament]);

  useEffect(() => {
    if (currentTournamentResult && currentTournamentResult.tournamentId === tournamentId && tournament) {
      const currentTotalRounds = tournament.totalRounds || 0;

      const normalizedPlayerScores = currentTournamentResult.playerScores.map(ps => {
        const playerRegInfo = registeredPlayers.find(p => p.id === ps.playerId);
        const newRoundScores = [...(ps.roundScores || [])]; 
        while (newRoundScores.length < currentTotalRounds) {
          newRoundScores.push(null);
        }
        return {
          ...ps,
          playerName: playerRegInfo?.playerName || ps.playerName || 'N/A',
          fideRating: playerRegInfo?.fideRating !== undefined ? playerRegInfo.fideRating : ps.fideRating,
          roundScores: newRoundScores.slice(0, currentTotalRounds),
          totalScore: ps.totalScore, // Assuming totalScore is correctly calculated by the hook/API
        };
      });

      const sortedStandings = [...normalizedPlayerScores].sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return (a.playerName || 'N/A').localeCompare(b.playerName || 'N/A');
      });
      
      setTournamentStandings(prevStandings => {
        if (!areStandingsEqual(prevStandings, sortedStandings)) {
          return sortedStandings;
        }
        return prevStandings;
      });

    } else if (tournament) { 
        setTournamentStandings(prevStandings => {
          if (prevStandings.length !== 0) {
            return [];
          }
          return prevStandings;
        });
    }
  }, [currentTournamentResult, tournamentId, tournament, registeredPlayers]);


  if (isLoadingTournamentDetails || tournament === undefined) {
    return (
       <>
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (tournament === null) {
    notFound();
  }

  const getStatusVariant = (status: typeof tournament.status) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Upcoming': return 'secondary';
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const handlePublicFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handlePublicRegistrationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name to register.",
        variant: "destructive",
      });
      return;
    }
    if (!tournament) return;

    setIsSubmittingRegistration(true);
    let uploadedScreenshotUrl: string | undefined = undefined;
    
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'Payment screenshot upload failed.');
        }
        uploadedScreenshotUrl = uploadResult.url;
      }

      await addRegistration({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        playerName,
        playerEmail,
        feePaid: false, 
        gender: gender || undefined, 
        dob,
        organization,
        mobile,
        fideRating: Number(fideRating) || 0,
        fideId: fideId || '-',
        paymentScreenshotUrl: uploadedScreenshotUrl,
      });
      toast({
        title: "Registration Submitted!",
        description: `Thank you, ${playerName}, for registering for "${tournament.name}". Your registration is pending confirmation by the organizer.`,
      });
      setPlayerName('');
      setPlayerEmail('');
      setGender(undefined);
      setDob('');
      setOrganization('');
      setMobile('');
      setFideRating(0);
      setFideId('-');
      setSelectedFile(null);
      if(publicFileInputRef.current) {
        publicFileInputRef.current.value = '';
      }
      fetchRegistrationsByTournamentId(tournamentId);
    } catch (error) {
      console.error("Failed to register player:", error);
      toast({
        title: "Registration Failed",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRegistration(false);
    }
  };
  
  const totalRounds = tournament?.totalRounds || 0;
  const coverImageSrc = tournament?.imageUrl || `https://placehold.co/1200x400.png`;
  const registrationCardKey = tournament.status === 'Upcoming' ? 'form-active' : 'form-inactive';


  return (
    <>
      <Header />
      <main className="flex-grow bg-gradient-to-br from-primary/5 to-accent/5 py-10">
        <div className="container mx-auto px-4">
          <Card className="shadow-xl overflow-hidden">
            <div className="relative h-64 md:h-96 w-full">
              <Image 
                src={coverImageSrc} 
                alt={`${tournament.name} cover image`} 
                fill
                style={{objectFit:"cover"}}
                className="bg-muted"
                data-ai-hint="chess tournament"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = `https://placehold.co/1200x400.png`; 
                  target.src = `https://placehold.co/1200x400.png`; 
                }}
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6 md:p-8">
                <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2">
                    {tournament.status === 'Active' && (
                        <Badge variant="destructive" className="text-sm px-3 py-1 animate-pulse">
                            <RadioTower className="w-4 h-4 mr-1.5" /> LIVE
                        </Badge>
                    )}
                    <Badge variant={getStatusVariant(tournament.status)} className="text-sm px-3 py-1">
                      {tournament.status}
                    </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 shadow-text">{tournament.name}</h1>
                <p className="text-lg md:text-xl text-primary-foreground/80 shadow-text flex items-center">
                  <MapPin className="w-5 h-5 mr-2" /> {tournament.location}
                </p>
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
                      <Info className="w-6 h-6 mr-2" /> About this Tournament
                    </h2>
                    <p className="text-lg text-foreground/90 whitespace-pre-line leading-relaxed">
                      {tournament.description}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                      <UserPlus className="w-6 h-6 mr-2" /> Tournament Registration
                    </h2>
                    {tournament.status === 'Upcoming' ? (
                      <Card key={registrationCardKey}>
                        <CardHeader>
                          <CardTitle>Register Now!</CardTitle>
                          <CardDescription>Entry Fee: ${tournament.entryFee}</CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePublicRegistrationSubmit}>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="publicPlayerName">Full Name <span className="text-destructive">*</span></Label>
                                <Input
                                  id="publicPlayerName"
                                  type="text"
                                  value={playerName}
                                  onChange={(e) => setPlayerName(e.target.value)}
                                  placeholder="Enter your full name"
                                  required
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="publicPlayerEmail">Email</Label>
                                <Input
                                  id="publicPlayerEmail"
                                  type="email"
                                  value={playerEmail}
                                  onChange={(e) => setPlayerEmail(e.target.value)}
                                  placeholder="your.email@example.com"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="gender">Gender</Label>
                                 <Select value={gender} onValueChange={setGender}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                  id="dob"
                                  type="date"
                                  value={dob}
                                  onChange={(e) => setDob(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                <Label htmlFor="organization">Organization/School/College</Label>
                                <Input
                                  id="organization"
                                  type="text"
                                  value={organization}
                                  onChange={(e) => setOrganization(e.target.value)}
                                  placeholder="e.g., City Chess Club"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                  id="mobile"
                                  type="tel"
                                  value={mobile}
                                  onChange={(e) => setMobile(e.target.value)}
                                  placeholder="e.g., +1234567890"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="fideRating">FIDE Rating</Label>
                                <Input
                                  id="fideRating"
                                  type="number"
                                  value={fideRating}
                                  onChange={(e) => setFideRating(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="e.g., 1500 (0 if unrated)"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="fideId">FIDE ID</Label>
                                <Input
                                  id="fideId"
                                  type="text"
                                  value={fideId}
                                  onChange={(e) => setFideId(e.target.value)}
                                  placeholder="e.g., 1234567 ('-' if none)"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="publicPaymentScreenshotFile" className="flex items-center">
                                <Upload className="w-4 h-4 mr-2 text-muted-foreground" /> Payment Screenshot
                              </Label>
                              <Input
                                id="publicPaymentScreenshotFile"
                                type="file"
                                ref={publicFileInputRef}
                                onChange={handlePublicFileChange}
                                className="mt-1"
                                accept="image/png, image/jpeg, image/gif"
                              />
                               {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
                               <p className="text-sm text-muted-foreground mt-1">
                                Please upload your payment proof (PNG, JPG, GIF).
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button type="submit" disabled={isSubmittingRegistration || isLoadingRegistrations} className="w-full sm:w-auto">
                              {isSubmittingRegistration || isLoadingRegistrations ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Submit Registration
                            </Button>
                          </CardFooter>
                        </form>
                      </Card>
                    ) : (
                      <Card key={registrationCardKey} className="bg-muted/50">
                        <CardContent className="pt-6 text-center">
                          <p className="text-muted-foreground text-lg">
                            {tournament.status === 'Active' ? "This tournament is currently active. Registrations are closed." :
                             tournament.status === 'Completed' ? "This tournament has been completed. Registrations are closed." :
                             tournament.status === 'Cancelled' ? "This tournament has been cancelled. Registrations are not available." :
                             "Registrations are currently closed for this tournament."}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </section>

                  <section>
                    <div className="flex justify-between items-center mb-4">
                       <h2 className="text-2xl font-semibold text-primary flex items-center">
                        <ListChecks className="w-6 h-6 mr-2" /> Registered Players ({isLoadingRegistrations ? <Loader2 className="inline w-4 h-4 animate-spin"/> : registeredPlayers.length})
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => setShowRegisteredPlayers(!showRegisteredPlayers)}>
                        {showRegisteredPlayers ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {showRegisteredPlayers ? "Hide Players" : "Show Players"}
                      </Button>
                    </div>
                    {showRegisteredPlayers && (
                      <>
                        {isLoadingRegistrations && registeredPlayers.length === 0 ? (
                          <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : !isLoadingRegistrations && errorRegistrations ? (
                          <div className="bg-destructive/10 p-6 rounded-lg text-center text-destructive">
                              <Users className="w-12 h-12 mx-auto mb-3" />
                              <p>Error loading registrations: {errorRegistrations}</p>
                          </div>
                        ): registeredPlayers.length > 0 ? (
                          <Card>
                            <CardContent className="pt-6 max-h-96 overflow-y-auto">
                              <ul className="space-y-3">
                                {registeredPlayers.map(reg => (
                                  <li key={reg.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
                                    <div className="flex items-center">
                                      <Users className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
                                      <div>
                                        <span className="font-medium text-foreground">{reg.playerName}</span>
                                        {reg.fideRating && reg.fideRating > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                              Rating: {reg.fideRating}
                                            </Badge>
                                          )}
                                      </div>
                                    </div>
                                    {reg.paymentScreenshotUrl && (
                                      <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                        <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" title="View Payment Proof">
                                          <Eye className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="bg-muted p-6 rounded-lg text-center">
                              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                              <p className="text-muted-foreground">No players registered yet. {tournament.status === 'Upcoming' && 'Be the first!'}</p>
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  <section>
                     <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                      <BarChart3 className="w-6 h-6 mr-2" /> Results & Standings
                    </h2>
                    {isLoadingSavedResults && tournament.status !== 'Upcoming' && (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    )}
                    {!isLoadingSavedResults && errorResults && tournament.status !== 'Upcoming' && (
                       <div className="bg-destructive/10 p-6 rounded-lg text-center text-destructive">
                          <Trophy className="w-12 h-12 mx-auto mb-3" />
                          <p>Error loading results: {errorResults}</p>
                      </div>
                    )}
                    {!isLoadingSavedResults && !errorResults && tournament.status === 'Upcoming' && (
                       <div className="bg-muted p-6 rounded-lg text-center">
                          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">Results will be published here once the tournament begins and scores are entered.</p>
                      </div>
                    )}
                    {!isLoadingSavedResults && !errorResults && tournament.status === 'Cancelled' && (
                       <div className="bg-muted p-6 rounded-lg text-center">
                          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">Results are not applicable as this tournament has been cancelled.</p>
                      </div>
                    )}
                    {!isLoadingSavedResults && !errorResults && (tournament.status === 'Active' || tournament.status === 'Completed') && totalRounds > 0 && (
                      tournamentStandings.length > 0 ? (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Player</TableHead>
                                    {[...Array(totalRounds)].map((_, i) => (
                                      <TableHead key={`round-col-${i + 1}`} className="text-center">R{i + 1}</TableHead>
                                    ))}
                                    <TableHead className="text-center font-semibold">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tournamentStandings.map((playerScore, index) => (
                                    <TableRow key={playerScore.playerId}>
                                      <TableCell className="font-medium">{index + 1}</TableCell>
                                      <TableCell>
                                        {playerScore.playerName || 'N/A'}
                                        {playerScore.fideRating && playerScore.fideRating > 0 ? (
                                          <span className="text-xs text-muted-foreground ml-1">({playerScore.fideRating})</span>
                                        ) : null}
                                      </TableCell>
                                      {Array.isArray(playerScore.roundScores) && playerScore.roundScores.map((score, roundIdx) => (
                                        <TableCell key={`player-${playerScore.playerId}-round-${roundIdx}`} className="text-center">
                                          {score !== null ? score.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-'}
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-center font-bold">{playerScore.totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                         <div className="bg-muted p-6 rounded-lg text-center">
                            <ListOrdered className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                              {tournament.status === 'Active' ? 'Live results will appear here as they are updated.' : 'Final results are being processed or no scores have been entered yet.'}
                            </p>
                        </div>
                      )
                    )}
                     {!isLoadingSavedResults && !errorResults && (tournament.status === 'Active' || tournament.status === 'Completed') && totalRounds === 0 && (
                         <div className="bg-muted p-6 rounded-lg text-center">
                            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">Results cannot be displayed as no rounds are defined for this tournament.</p>
                        </div>
                    )}
                  </section>
                </div>

                <aside className="space-y-6 md:sticky md:top-24"> 
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl text-primary flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2" /> Tournament Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Start Date:</strong> {format(new Date(tournament.startDate), 'EEEE, MMMM dd, yyyy')}</p>
                      <p><strong>End Date:</strong> {format(new Date(tournament.endDate), 'EEEE, MMMM dd, yyyy')}</p>
                       {totalRounds > 0 && <p><strong>Total Rounds:</strong> {totalRounds}</p>}
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-md">
                    <CardHeader>
                       <CardTitle className="text-xl text-primary flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" /> Fees & Prizes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Entry Fee:</strong> ${tournament.entryFee.toLocaleString()}</p>
                      <p><strong>Prize Fund:</strong> ${tournament.prizeFund.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                   <Card className="shadow-md">
                    <CardHeader>
                       <CardTitle className="text-xl text-primary flex items-center">
                        <Clock className="w-5 h-5 mr-2" /> Time Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>{tournament.timeControl}</p>
                    </CardContent>
                  </Card>
                  
                  <Button className="w-full text-lg" size="lg" asChild>
                    <Link href="/tournaments"> 
                        <Eye className="mr-2 h-5 w-5" /> Back to All Tournaments
                    </Link>
                  </Button>
                </aside>
              </div>
            </CardContent>
          </Card>
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
