import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Runs one live storage suite through Vitest.
 *
 * The adapters are TypeScript with parameter properties and `server-only`
 * imports, which plain `node script.ts` cannot execute — Node's strip-only
 * transform refuses the former and the package throws for the latter. The test
 * runner already owns that pipeline (and stubs `server-only`), so the live
 * check borrows it rather than keeping a second, drifting copy of the adapter.
 *
 * `OPB_LIVE_VERIFY` is set here so the suites skip during `npm test` and only
 * run when somebody deliberately asked for a live account.
 */
export function runLiveVerification(testFile, testNamePattern) {
  const vitest = path.join(process.cwd(), 'node_modules', 'vitest', 'vitest.mjs');
  if (!existsSync(vitest)) {
    console.error(
      '\nVitest is not installed. Run `npm ci` first — the live check uses the ' +
        'same TypeScript pipeline as the test suite.\n'
    );
    process.exit(1);
  }

  const args = [vitest, 'run', testFile, '--reporter=verbose', '-t', testNamePattern];
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, OPB_LIVE_VERIFY: '1' },
  });

  child.on('error', (err) => {
    console.error('Could not start the test runner:', err);
    process.exit(1);
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      console.error(`Live verification stopped by ${signal}.`);
      process.exit(1);
    }
    process.exit(code ?? 1);
  });
}
