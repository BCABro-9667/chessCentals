// src/app/dashboard/tournaments/[id]/registrations/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTournaments } from '@/hooks/useTournaments';
import { usePlayerRegistrations } from '@/hooks/usePlayerRegistrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowLeft, PlusCircle, CheckCircle, XCircle, Loader2, Trash2, Eye, Edit, Copy } from 'lucide-react';
import { format } from 'date-fns';
import type { Tournament } from '@/types/tournament';
import type { PlayerRegistration } from '@/types/playerRegistration';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import EditPlayerRegistrationModal from '@/components/modals/EditPlayerRegistrationModal';

export default function ViewRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { toast } = useToast();

  const { getTournamentById, isLoadingTournaments: isLoadingTournamentDetails } = useTournaments();
  const { 
    getRegistrationsByTournamentId, 
    fetchRegistrationsByTournamentId,
    isLoadingRegistrations, 
    deleteRegistration, 
    updateRegistration,
    errorRegistrations 
  } = usePlayerRegistrations();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const currentRegistrations = getRegistrationsByTournamentId(tournamentId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<PlayerRegistration | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  useEffect(() => {
    if (!isLoadingTournamentDetails && tournamentId) {
      const fetchedTournament = getTournamentById(tournamentId);
      setTournament(fetchedTournament);
    }
  }, [isLoadingTournamentDetails, tournamentId, getTournamentById]);

  useEffect(() => {
    if (tournamentId) {
      fetchRegistrationsByTournamentId(tournamentId);
    }
  }, [tournamentId, fetchRegistrationsByTournamentId]);

  const handleDeleteRegistration = async (regId: string, playerName: string) => {
    try {
      await deleteRegistration(regId, tournamentId);
      toast({
        title: "Registration Deleted",
        description: `Registration for ${playerName} has been deleted.`,
      });
    } catch (e) {
      toast({
        title: "Error Deleting Registration",
        description: (e as Error).message || "Could not delete registration.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditModal = (registration: PlayerRegistration) => {
    setEditingRegistration(registration);
    setIsEditModalOpen(true);
  };

  const handleSaveRegistration = async (updatedData: PlayerRegistration, newFile?: File | null) => {
    if (!editingRegistration) return;
    setIsSubmittingEdit(true);
    let finalScreenshotUrl = updatedData.paymentScreenshotUrl;

    try {
      if (newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'New payment screenshot upload failed.');
        }
        finalScreenshotUrl = uploadResult.url;
      }
      
      const payload: Partial<PlayerRegistration> = {
        ...updatedData, 
        paymentScreenshotUrl: finalScreenshotUrl, 
      };
      delete (payload as any).id; 
      delete (payload as any).tournamentId;


      await updateRegistration(editingRegistration.id, payload);
      toast({
        title: "Registration Updated",
        description: `Details for ${updatedData.playerName} have been updated.`,
      });
      setIsEditModalOpen(false);
      setEditingRegistration(null);
      fetchRegistrationsByTournamentId(tournamentId); 
    } catch (e) {
      toast({
        title: "Error Updating Registration",
        description: (e as Error).message || "Could not update registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };


  const toggleFeePaidStatus = async (registration: PlayerRegistration) => {
    const updates: Partial<PlayerRegistration> = { ...registration, feePaid: !registration.feePaid };
    const payloadToUpdate = { ...updates };
    delete (payloadToUpdate as any).id;
    delete (payloadToUpdate as any).tournamentId;


    try {
      await updateRegistration(registration.id, payloadToUpdate);
      toast({
        title: "Payment Status Updated",
        description: `Fee payment status for ${registration.playerName} has been updated.`,
      });
       fetchRegistrationsByTournamentId(tournamentId); 
    } catch (e) {
       toast({
        title: "Error Updating Status",
        description: (e as Error).message || "Could not update payment status.",
        variant: "destructive",
      });
    }
  };

  const handleCopyDataForExcel = () => {
    if (currentRegistrations.length === 0) {
      toast({ title: "No Data", description: "There are no registrations to copy." });
      return;
    }
    const header = [
      "Player Name", "Email", "Gender", "DOB", "Organization", "Mobile", 
      "FIDE Rating", "FIDE ID", "Fee Paid", "Payment Screenshot URL", "Registered On"
    ].join("\t");

    const dataRows = currentRegistrations.map(reg => [
      reg.playerName,
      reg.playerEmail || "",
      reg.gender || "",
      reg.dob ? format(new Date(reg.dob), 'yyyy-MM-dd') : "",
      reg.organization || "",
      reg.mobile || "",
      String(reg.fideRating || 0),
      reg.fideId || "-",
      reg.feePaid ? "Yes" : "No",
      reg.paymentScreenshotUrl || "",
      format(new Date(reg.registrationDate), 'yyyy-MM-dd HH:mm')
    ].join("\t")).join("\n");

    const tsvData = `${header}\n${dataRows}`;

    navigator.clipboard.writeText(tsvData)
      .then(() => {
        toast({ title: "Data Copied!", description: "Registration data copied to clipboard. You can now paste it into Excel." });
      })
      .catch(err => {
        console.error("Failed to copy data: ", err);
        toast({ title: "Copy Failed", description: "Could not copy data to clipboard.", variant: "destructive" });
      });
  };


  if (isLoadingTournamentDetails || tournament === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Card className="max-w-7xl mx-auto w-full">
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tournament === null) {
    notFound();
  }
  
  if (errorRegistrations) {
    return (
      <div className="space-y-6 text-center text-destructive">
        <h1 className="text-2xl font-bold">Error Loading Registrations</h1>
        <p>{errorRegistrations}</p>
         <Button variant="outline" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Users className="w-8 h-8 mr-3 text-primary" />
          Registered Players: {tournament?.name}
        </h1>
        <div className="flex flex-wrap gap-2">
           {(tournament?.status === 'Active' || tournament?.status === 'Upcoming') && (
            <Button asChild>
                <Link href={`/dashboard/tournaments/${tournamentId}/register`}>
                <PlusCircle className="mr-2 h-4 w-4" /> RegisterPlayer
                </Link>
            </Button>
            )}
          <Button variant="outline" onClick={handleCopyDataForExcel}>
            <Copy className="mr-2 h-4 w-4" /> Copy Data for Excel
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>
      </div>

      <Card className="max-w-7xl mx-auto w-full"> {/* Added max-width and centering */}
        <CardHeader>
          <CardTitle>Player List ({isLoadingRegistrations && currentRegistrations.length === 0 ? <Loader2 className="inline w-4 h-4 animate-spin"/> : currentRegistrations.length})</CardTitle>
          <CardDescription>
            Manage and view players registered for &quot;{tournament?.name}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRegistrations && currentRegistrations.length === 0 ? (
            <div className="space-y-2">
              {[...Array(5)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !isLoadingRegistrations && currentRegistrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No players registered for this tournament yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>FIDE Rating</TableHead>
                    <TableHead>FIDE ID</TableHead>
                    <TableHead className="text-center">Fee Paid</TableHead>
                    <TableHead className="text-center">Screenshot</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.playerName}</TableCell>
                      <TableCell>{reg.playerEmail || 'N/A'}</TableCell>
                      <TableCell>{reg.gender || 'N/A'}</TableCell>
                      <TableCell>{reg.dob ? format(new Date(reg.dob), 'PP') : 'N/A'}</TableCell>
                      <TableCell>{reg.organization || 'N/A'}</TableCell>
                      <TableCell>{reg.mobile || 'N/A'}</TableCell>
                      <TableCell>{reg.fideRating > 0 ? reg.fideRating : 'Unrated'}</TableCell>
                      <TableCell>{reg.fideId || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleFeePaidStatus(reg)}
                          className={reg.feePaid ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                          disabled={isLoadingRegistrations}
                          title={reg.feePaid ? "Mark as Unpaid" : "Mark as Paid"}
                        >
                          {isLoadingRegistrations && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {reg.feePaid ? 
                            <CheckCircle className="w-5 h-5 mr-1" /> : 
                            <XCircle className="w-5 h-5 mr-1" />
                          }
                          {reg.feePaid ? 'Paid' : 'Unpaid'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {reg.paymentScreenshotUrl ? (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="View Payment Screenshot"
                          >
                            <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(reg.registrationDate), 'PPp')}</TableCell>
                      <TableCell className="text-right space-x-1">
                         <Button variant="ghost" size="icon" title="Edit Registration" onClick={() => handleOpenEditModal(reg)} disabled={isLoadingRegistrations}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Registration" className="text-destructive hover:text-destructive/80" disabled={isLoadingRegistrations}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the registration for {reg.playerName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRegistration(reg.id, reg.playerName)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {editingRegistration && (
        <EditPlayerRegistrationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRegistration(null);
          }}
          registration={editingRegistration}
          onSave={handleSaveRegistration}
          isLoading={isSubmittingEdit}
        />
      )}
    </div>
  );
}
