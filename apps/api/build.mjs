import { build } from 'esbuild';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('dist');
const productionEnvironment = resolve('src/environments/environment.prod.ts');

await rm(outputDirectory, { recursive: true, force: true });

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: resolve(outputDirectory, 'server.mjs'),
  format: 'esm',
  packages: 'bundle',
  plugins: [
    {
      name: 'production-environment',
      setup(buildContext) {
        buildContext.onResolve({ filter: /^\.\/environments\/environment\.js$/ }, () => ({
          path: productionEnvironment,
        }));
      },
    },
  ],
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
});
