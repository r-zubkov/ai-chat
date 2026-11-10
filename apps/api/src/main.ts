import { TimewebAdapter } from './adapters/timeweb/timeweb.adapter.js';
import { loadTimewebConfig } from './adapters/timeweb/timeweb.config.js';
import { createApplication } from './app.js';
import { loadApiEnvironment, readEnvironment } from './config/environment.js';
import { createAvailableModels } from './models/available-models.js';

async function main(): Promise<void> {
  loadApiEnvironment();
  const environment = readEnvironment();
  const timewebConfig = loadTimewebConfig();
  const timewebAdapter = new TimewebAdapter(timewebConfig);
  const availableModels = createAvailableModels([
    { adapter: timewebAdapter.id, modelIds: Array.from(timewebConfig.agentIds.keys()) },
  ]);
  const { httpServer } = createApplication(environment, [timewebAdapter], availableModels);

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
