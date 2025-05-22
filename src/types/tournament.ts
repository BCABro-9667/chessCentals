// src/types/tournament.ts
export interface Tournament {
  id: string;
  name: string;
  type: 'Swiss' | 'Round Robin' | 'Knockout' | 'Arena' | 'Scheveningen' | 'Other';
  location: string;
  startDate: string; // ISO string format
  endDate: string;   // ISO string format
  entryFee: number;
  prizeFund: number;
  timeControl: string;
  description: string;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  totalRounds?: number; // New field for total rounds
  imageUrl?: string; // New field for custom image URL
  organizerEmail: string; // Added for data ownership
}

export const tournamentTypes: Tournament['type'][] = ['Swiss', 'Round Robin', 'Knockout', 'Arena', 'Scheveningen', 'Other'];
export const tournamentStatuses: Tournament['status'][] = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
