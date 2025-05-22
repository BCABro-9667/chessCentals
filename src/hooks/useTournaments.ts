// src/hooks/useTournaments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Tournament } from '@/types/tournament';

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false); // Set to false initially
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
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch tournaments: ${response.statusText}` }));
        throw new Error(errorData.message || `Failed to fetch tournaments: ${response.statusText}`);
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

  // Removed automatic initial fetch. Pages are now responsible for calling fetchTournaments.

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
      // Re-fetch based on context, typically the organizer's email for dashboard views
      await fetchTournaments(tournamentData.organizerEmail); 
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
    // This function still operates on the locally cached 'tournaments' state.
    // For public detail pages, it's better to fetch the specific tournament by ID via API.
    return tournaments.find(t => t.id === id);
  }, [tournaments]);

  const updateTournament = useCallback(async (id: string, tournamentData: Partial<Omit<Tournament, 'id' | 'status' | 'organizerEmail'>>) => {
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
      // Fetch with the organizerEmail of the updated tournament to refresh the correct list.
      // This assumes the dashboard context is showing tournaments for this organizer.
      // If the current 'tournaments' list is global, this might need adjustment or rely on a broader refresh.
      // For now, we'll use the updatedTournament's organizerEmail.
      await fetchTournaments(updatedTournament.organizerEmail); 
      return updatedTournament;
    } catch (err) {
      console.error(`Failed to update tournament ${id} via API`, err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments]);

  const updateTournamentStatus = useCallback(async (id: string, status: Tournament['status']) => {
    setError(null);
    const originalTournaments = [...tournaments];
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
        setTournaments(originalTournaments); 
        throw new Error(errorData.message || `Failed to update tournament status: ${response.statusText}`);
      }
      const updatedTournament: Tournament = await response.json();
      // Refresh the list, using the organizer's email from the updated tournament
      // to ensure the dashboard view (if filtered) remains consistent.
      await fetchTournaments(updatedTournament.organizerEmail); 
    } catch (err) {
      console.error("Failed to update tournament status via API", err);
      setError((err as Error).message);
      setTournaments(originalTournaments); // Rollback on error
    }
  }, [tournaments, fetchTournaments]);

  const deleteTournament = useCallback(async (id: string) => {
    setIsLoadingTournaments(true);
    setError(null);
    try {
      const tournamentToDelete = tournaments.find(t => t.id === id);
      const organizerEmailForRefresh = tournamentToDelete?.organizerEmail;

      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete tournament: ${response.statusText}`);
      }
      await fetchTournaments(organizerEmailForRefresh);
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
    getTournamentById, // Note: Consider deprecating for detail pages if they fetch their own data
    updateTournament,
    updateTournamentStatus, 
    deleteTournament,
    isLoadingTournaments,
    errorLoadingTournaments: error,
    refreshTournaments,
    fetchTournaments // Expose fetchTournaments for direct use by pages
  };
}
