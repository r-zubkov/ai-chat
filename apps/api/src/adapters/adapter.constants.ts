export const ADAPTER = {
  TIMEWEB: 'timeweb',
} as const;

export type AdapterId = (typeof ADAPTER)[keyof typeof ADAPTER];
