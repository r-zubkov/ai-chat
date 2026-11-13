import type { ApiEnvironment } from './environment.model.js';

export const environment = {
  production: false,
  port: 5000,
} as const satisfies ApiEnvironment;
