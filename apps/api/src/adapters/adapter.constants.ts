export const ADAPTER = {
  TIMEWEB: 'timeweb',
} as const;

export type Adapter = (typeof ADAPTER)[keyof typeof ADAPTER];
