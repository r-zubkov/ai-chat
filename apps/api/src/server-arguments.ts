const SERVE_STATIC_ARGUMENT = '--serve-static';

export interface ServerArguments {
  readonly serveStatic: boolean;
  readonly adapterEnvironmentArguments: readonly string[];
}

export function parseServerArguments(
  arguments_: readonly string[] = process.argv.slice(2),
): ServerArguments {
  let serveStatic = false;
  const adapterEnvironmentArguments: string[] = [];

  for (const argument of arguments_) {
    if (argument === SERVE_STATIC_ARGUMENT) {
      if (serveStatic) {
        throw new Error('The serve-static flag must be specified only once');
      }

      serveStatic = true;
      continue;
    }

    adapterEnvironmentArguments.push(argument);
  }

  return {
    serveStatic,
    adapterEnvironmentArguments,
  };
}
