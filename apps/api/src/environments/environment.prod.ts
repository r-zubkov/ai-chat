import type { ApiEnvironment } from './environment.model.js';

export const environment = {
  production: true,
  port: 5000,
} as const satisfies ApiEnvironment;
