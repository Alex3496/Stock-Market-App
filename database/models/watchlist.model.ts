import { Document, models, model, Schema } from 'mongoose';

export interface WatchlistItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate watchlist entries for the same user and symbol
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

// Export the model using the pattern to avoid hot-reload issues
export const Watchlist = models?.Watchlist || model<WatchlistItem>('Watchlist', WatchlistSchema);