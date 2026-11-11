import { parse } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ADAPTERS_ENV_FILE_ARGUMENT = '--adapters-env-file=';

export type AdapterEnvironment = Readonly<Record<string, string | undefined>>;

export async function loadAdapterEnvironment(
  arguments_: readonly string[] = process.argv.slice(2),
  processEnvironment: NodeJS.ProcessEnv = process.env,
): Promise<AdapterEnvironment> {
  let environmentFile: string | undefined;

  for (const argument of arguments_) {
    if (!argument.startsWith(ADAPTERS_ENV_FILE_ARGUMENT)) {
      throw new Error(`Unknown server argument: ${argument}`);
    }

    if (environmentFile !== undefined) {
      throw new Error('The adapters environment file must be specified only once');
    }

    environmentFile = argument.slice(ADAPTERS_ENV_FILE_ARGUMENT.length).trim();
    if (!environmentFile) {
      throw new Error('The adapters environment file path must not be empty');
    }
  }

  if (environmentFile === undefined) return processEnvironment;

  const environmentPath = resolve(environmentFile);

  try {
    return Object.freeze(parse(await readFile(environmentPath, 'utf8')));
  } catch (error: unknown) {
    throw new Error(`Failed to read adapters environment file: ${environmentPath}`, {
      cause: error,
    });
  }
}
