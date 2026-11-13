import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..');
const outputRoot = resolve(repositoryRoot, 'dist');
const webBuild = resolve(repositoryRoot, 'apps/web/dist/ai-chat/browser');
const apiBuild = resolve(repositoryRoot, 'apps/api/dist');

await rm(outputRoot, { recursive: true, force: true });
await mkdir(resolve(outputRoot, 'public'), { recursive: true });
await cp(webBuild, resolve(outputRoot, 'public'), { recursive: true });
await cp(resolve(apiBuild, 'server.mjs'), resolve(outputRoot, 'server.mjs'));
