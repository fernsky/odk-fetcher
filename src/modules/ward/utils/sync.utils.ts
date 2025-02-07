import { SYNC_CONFIG } from '../constants/sync.constants';

export function getValidSyncDate(dateString?: string): {
  timestamp: Date;
  message: string;
  status: 'success' | 'fallback';
} {
  const now = new Date();
  const maxAge = new Date(now);
  maxAge.setDate(now.getDate() - SYNC_CONFIG.MAX_SYNC_DAYS);

  try {
    if (!dateString) {
      return {
        timestamp: maxAge,
        message: 'Using default sync period',
        status: 'fallback',
      };
    }

    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }

    if (parsedDate > now) {
      return {
        timestamp: now,
        message: 'Future date adjusted to current time',
        status: 'fallback',
      };
    }

    if (parsedDate < maxAge) {
      return {
        timestamp: maxAge,
        message: 'Date too old, adjusted to maximum allowed age',
        status: 'fallback',
      };
    }

    return {
      timestamp: parsedDate,
      message: 'Valid sync date',
      status: 'success',
    };
  } catch {
    return {
      timestamp: maxAge,
      message: 'Invalid date, using default sync period',
      status: 'fallback',
    };
  }
}
