'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      console.error('No database connection');
      return [];
    }

    // Find the user by email in the user collection (Better Auth)
    const user = await db.collection('users').findOne(
      { email: email },
    );

    if (!user) {
      console.log(`User with email ${email} not found`);
      return [];
    }

    // Use the user's id or _id for querying the watchlist
    const userId = user.id || user._id.toString();

    // Query the Watchlist by userId and return just the symbols
    const watchlistItems = await Watchlist.find(
      { userId: userId },
      { symbol: 1, _id: 0 }
    ).lean();

    return watchlistItems.map(item => item.symbol);

  } catch (error) {
    console.error('Error getting watchlist symbols by email:', error);
    return [];
  }
};
