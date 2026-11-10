import { config as loadDotenv } from 'dotenv';
import { basename, dirname, resolve } from 'node:path';

export interface ApiEnvironment {
  readonly mode: string;
  readonly port: number;
  readonly corsOrigin: string;
}

export function loadApiEnvironment(): void {
  if (process.env['ENV'] === 'test') return;

  const workingDirectory = process.cwd();
  const runsFromApiWorkspace =
    basename(workingDirectory) === 'api' && basename(dirname(workingDirectory)) === 'apps';
  const environmentPath = resolve(
    workingDirectory,
    runsFromApiWorkspace ? '.env' : 'apps/api/.env',
  );

  loadDotenv({ path: environmentPath });
}

export function readEnvironment(source: NodeJS.ProcessEnv = process.env): ApiEnvironment {
  const port = Number(source['PORT'] ?? 5000);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return Object.freeze({
    mode: source['ENV']?.trim() || 'production',
    port,
    corsOrigin: source['CORS']?.trim() || 'http://localhost:4200',
  });
}
