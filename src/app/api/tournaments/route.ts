// src/app/api/tournaments/route.ts
import { NextResponse } from 'next/server';
import type { Tournament } from '@/types/tournament';
import { getTournamentsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerEmail = searchParams.get('organizerEmail');

    const tournamentsCollection = await getTournamentsCollection();
    
    const query: any = {};
    if (organizerEmail) {
      query.organizerEmail = organizerEmail;
    }

    const tournamentsFromDb = await tournamentsCollection.find(query).sort({ startDate: -1 }).toArray();
    
    const tournaments = tournamentsFromDb.map(t => {
      const { _id, ...rest } = t;
      return { ...rest, id: _id.toHexString() };
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Failed to fetch tournaments:', error);
    return NextResponse.json({ message: 'Error fetching tournaments', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tournamentData = await request.json() as Omit<Tournament, 'id' | 'status'>;
    
    if (!tournamentData.name || !tournamentData.startDate || !tournamentData.organizerEmail) {
        return NextResponse.json({ message: 'Missing required tournament data (name, startDate, organizerEmail)' }, { status: 400 });
    }

    const newTournament: Omit<Tournament, 'id'> = {
      ...tournamentData,
      status: 'Upcoming', 
    };

    const tournamentsCollection = await getTournamentsCollection();
    const result = await tournamentsCollection.insertOne(newTournament as any); 

    if (!result.insertedId) {
        return NextResponse.json({ message: 'Failed to insert tournament into database' }, { status: 500 });
    }
    
    const createdTournament: Tournament = {
        ...newTournament,
        id: result.insertedId.toHexString(),
    };

    return NextResponse.json(createdTournament, { status: 201 });
  } catch (error) {
    console.error('Failed to create tournament:', error);
    return NextResponse.json({ message: 'Error creating tournament', error: (error as Error).message }, { status: 500 });
  }
}
