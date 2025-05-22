// src/hooks/useTournaments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Tournament } from '@/types/tournament';

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async (organizerEmail?: string | null) => {
    setIsLoadingTournaments(true);
    setError(null);
    try {
      let url = '/api/tournaments';
      if (organizerEmail) {
        url += `?organizerEmail=${encodeURIComponent(organizerEmail)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch tournaments: ${response.statusText}`);
      }
      const data: Tournament[] = await response.json();
      setTournaments(data);
    } catch (err) {
      console.error("Failed to load tournaments from API", err);
      setError((err as Error).message);
      setTournaments([]); 
    } finally {
      setIsLoadingTournaments(false);
    }
  }, []);

  // Initial fetch for public pages (all tournaments)
  useEffect(() => {
    // This initial fetch might be redundant if dashboard pages always call with email
    // Or, we can decide if public pages show all or if this hook is dashboard-specific
    // For now, let it fetch all initially for broader use (e.g., public /tournaments page)
    fetchTournaments(); 
  }, [fetchTournaments]);

  const addTournament = useCallback(async (tournamentData: Omit<Tournament, 'id' | 'status'>) => {
    setIsLoadingTournaments(true); 
    setError(null);
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add tournament: ${response.statusText}`);
      }
      const newTournament: Tournament = await response.json();
      // Re-fetch based on current context (e.g., if organizerEmail was used for initial load)
      // For simplicity, we can re-fetch all or based on a passed param if this hook serves both dashboard and public
      await fetchTournaments(tournamentData.organizerEmail); // Re-fetch for the specific organizer after adding
      return newTournament;
    } catch (err) {
      console.error("Failed to add tournament via API", err);
      setError((err as Error).message);
      throw err; 
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments]);
  
  const getTournamentById = useCallback((id: string): Tournament | undefined => {
    return tournaments.find(t => t.id === id);
  }, [tournaments]);

  const updateTournament = useCallback(async (id: string, tournamentData: Partial<Omit<Tournament, 'id' | 'status' | 'organizerEmail'>>) => {
    // OrganizerEmail should not be updatable through this general update path
    setIsLoadingTournaments(true);
    setError(null);
    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update tournament: ${response.statusText}`);
      }
      const updatedTournament: Tournament = await response.json();
      // Smart re-fetch: if current tournaments are filtered by an email, re-fetch with that email
      const currentFilteredEmail = tournaments.length > 0 ? tournaments[0].organizerEmail : undefined;
      await fetchTournaments(currentFilteredEmail); // Or, if this tournament's organizerEmail is known and consistent
      return updatedTournament;
    } catch (err) {
      console.error(`Failed to update tournament ${id} via API`, err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments, tournaments]);

  const updateTournamentStatus = useCallback(async (id: string, status: Tournament['status']) => {
    setError(null);
    const originalTournaments = [...tournaments];
     // Optimistic update
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }), 
      });
      if (!response.ok) {
        const errorData = await response.json();
        setTournaments(originalTournaments); // Rollback optimistic update
        throw new Error(errorData.message || `Failed to update tournament status: ${response.statusText}`);
      }
      // Successful update, fetch based on potential current filter
      const updatedTournament: Tournament = await response.json();
      setTournaments(prev => prev.map(t => (t.id === id ? updatedTournament : t))
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      );
    } catch (err) {
      console.error("Failed to update tournament status via API", err);
      setError((err as Error).message);
      // Rollback already happened if errorData was parsed
    }
  }, [tournaments]);

  const deleteTournament = useCallback(async (id: string) => {
    setIsLoadingTournaments(true);
    setError(null);
    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete tournament: ${response.statusText}`);
      }
      const currentFilteredEmail = tournaments.length > 0 && tournaments.some(t => t.id === id) ? tournaments.find(t=> t.id === id)?.organizerEmail : undefined;
      await fetchTournaments(currentFilteredEmail);
    } catch (err) {
      console.error(`Failed to delete tournament ${id} via API`, err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments, tournaments]);

  const refreshTournaments = useCallback((organizerEmail?: string | null) => {
    fetchTournaments(organizerEmail);
  }, [fetchTournaments]);


  return { 
    tournaments, 
    addTournament, 
    getTournamentById,
    updateTournament,
    updateTournamentStatus, 
    deleteTournament,
    isLoadingTournaments,
    errorLoadingTournaments: error,
    refreshTournaments
  };
}
