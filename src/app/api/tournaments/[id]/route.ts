// src/app/api/tournaments/[id]/route.ts
import { NextResponse } from 'next/server';
import type { Tournament } from '@/types/tournament';
import { getTournamentsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
    }
    const tournamentsCollection = await getTournamentsCollection();
    const tournamentFromDb = await tournamentsCollection.findOne({ _id: new ObjectId(params.id) });

    if (tournamentFromDb) {
      const { _id, ...rest } = tournamentFromDb;
      const tournament = { ...rest, id: _id.toHexString() } as Tournament; // Ensure organizerEmail is part of rest
      return NextResponse.json(tournament);
    } else {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch tournament ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
    }
    // Ensure organizerEmail is not part of the updatable fields from client for general updates
    // Ownership change should be a separate, more secure process if needed.
    const updates = await request.json() as Partial<Omit<Tournament, 'id' | 'organizerEmail'>>; 

    if ('id' in updates) delete (updates as any).id;
    if ('_id' in updates) delete (updates as any)._id;
    // if ('organizerEmail' in updates) delete (updates as any).organizerEmail; // Prevent changing owner easily

    const tournamentsCollection = await getTournamentsCollection();
    
    // For status-only updates, the body might only contain { status: 'NewStatus' }
    // For full edits, it would contain other fields.
    // The Omit in the type definition helps guide what fields are generally updatable.

    const result = await tournamentsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updates }, 
      { returnDocument: 'after' }
    );

    if (result) {
      const { _id, ...updatedTournamentData } = result;
      const updatedTournament = { ...updatedTournamentData, id: _id.toHexString() } as Tournament;
      return NextResponse.json(updatedTournament);
    } else {
      return NextResponse.json({ message: 'Tournament not found for update' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to update tournament ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
    }
    // Future: Add ownership check here. For now, any authenticated user (via dashboard access) can delete.
    const tournamentsCollection = await getTournamentsCollection();
    const result = await tournamentsCollection.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Tournament deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Tournament not found for deletion' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete tournament ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting tournament', error: (error as Error).message }, { status: 500 });
  }
}
