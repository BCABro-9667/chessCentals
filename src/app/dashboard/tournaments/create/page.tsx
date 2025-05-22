// src/app/dashboard/tournaments/create/page.tsx
"use client";

import TournamentForm from "@/components/forms/TournamentForm";
import { useTournaments } from "@/hooks/useTournaments";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Tournament } from "@/types/tournament";
import { format } from "date-fns";
import { FilePlus2 } from "lucide-react";
import { useAuthMock } from "@/hooks/useAuthMock"; // Import useAuthMock

export default function CreateTournamentPage() {
  const router = useRouter();
  const { addTournament } = useTournaments();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { currentUserEmail } = useAuthMock(); // Get current user's email

  const handleSubmit = async (data: Omit<Tournament, 'id' | 'status' | 'startDate' | 'endDate' | 'organizerEmail'> & { startDate: Date, endDate: Date }) => {
    setIsLoading(true);
    if (!currentUserEmail) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a tournament.",
        variant: "destructive",
      });
      setIsLoading(false);
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    try {
      const tournamentData: Omit<Tournament, 'id' | 'status'> = {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        endDate: format(data.endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        organizerEmail: currentUserEmail, // Add organizerEmail
      };
      const newTournament = await addTournament(tournamentData); // addTournament now returns a promise
      toast({
        title: "Tournament Created!",
        description: `"${newTournament.name}" has been successfully created.`,
      });
      router.push("/dashboard"); 
    } catch (error) {
      console.error("Failed to create tournament:", error);
      toast({
        title: "Error Creating Tournament",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FilePlus2 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Create New Tournament</h1>
      </div>
      <p className="text-muted-foreground">
        Fill in the details below to set up your new chess tournament. Use the AI generator for a captivating description!
      </p>
      <TournamentForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
