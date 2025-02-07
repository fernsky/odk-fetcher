export const SYNC_CONFIG = {
  MAX_SYNC_DAYS: 30,
  MIN_SYNC_DAYS: 1,
  DEFAULT_SYNC_DAYS: 30,
} as const;

export const SYNC_MESSAGES = {
  INVALID_DATE: 'Invalid date format provided, using fallback period',
  FUTURE_DATE: 'Future date not allowed, using current timestamp',
  TOO_OLD: 'Requested sync period too old, limited to maximum allowed period',
  NO_CHANGES: 'No changes found in the specified period',
  SUCCESS: (count: number, since: string) =>
    `Found ${count} changes since ${since}`,
} as const;
