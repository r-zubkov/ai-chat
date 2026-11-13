import { loadAdapterEnvironment } from './adapters/adapter-environment.js';
import { TimewebAdapter } from './adapters/timeweb/timeweb.adapter.js';
import { loadTimewebConfig } from './adapters/timeweb/timeweb.config.js';
import { createApplication } from './app.js';
import { environment } from './environments/environment.js';
import { createAvailableModels } from './models/available-models.js';

async function main(): Promise<void> {
  const adapterEnvironment = await loadAdapterEnvironment();
  const timewebConfig = loadTimewebConfig(adapterEnvironment);
  const timeweb = timewebConfig
    ? {
        adapter: new TimewebAdapter(timewebConfig),
        modelIds: Array.from(timewebConfig.agentIds.keys()),
      }
    : undefined;
  const availableModels = createAvailableModels(
    timeweb ? [{ adapter: timeweb.adapter.id, modelIds: timeweb.modelIds }] : [],
  );
  const { httpServer } = createApplication(
    environment,
    timeweb ? [timeweb.adapter] : [],
    availableModels,
  );

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
