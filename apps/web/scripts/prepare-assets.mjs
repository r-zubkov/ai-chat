import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(import.meta.dirname, '..');
const iconsPackageRoot = dirname(
  fileURLToPath(import.meta.resolve('@taiga-ui/icons/package.json')),
);
const source = resolve(iconsPackageRoot, 'src');
const target = resolve(workspaceRoot, '.generated/taiga-icons');

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
