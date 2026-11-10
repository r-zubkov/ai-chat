import { createTimewebAdapter } from './adapters/timeweb/timeweb.adapter.js';
import { createApplication } from './app.js';
import { loadApiEnvironment, readEnvironment } from './config/environment.js';

async function main(): Promise<void> {
  loadApiEnvironment();
  const environment = readEnvironment();
  const timewebAdapter = createTimewebAdapter();
  const { httpServer } = createApplication(environment, [timewebAdapter]);

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(environment.port, () => {
      httpServer.off('error', reject);
      console.log(`Backend listening on http://localhost:${environment.port}`);
      resolve();
    });
  });
}

main().catch((error: unknown) => {
  console.error('Failed to start backend', error);
  process.exitCode = 1;
});
