import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '..');
const source = resolve(workspaceRoot, '../../node_modules/@taiga-ui/icons/src');
const target = resolve(workspaceRoot, '.generated/taiga-icons');

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
