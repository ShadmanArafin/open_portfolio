'use client';

import { useEffect } from 'react';
import { startCollectingErrors } from './_components/error-log';

/**
 * Starts the admin's error log, once, in the shell.
 *
 * It lives in the protected layout rather than on the help screen because the
 * errors worth reporting are almost never the ones the help screen causes —
 * they happen on the screen somebody was actually using before they came here
 * to say so. The legacy admin defined this collector and then never mounted it
 * anywhere; the help screen's "recent errors" switch has been offering to
 * attach an always-empty list. Mounting it here makes the switch true without
 * changing what it says.
 */
export function ErrorCollector() {
  useEffect(() => {
    startCollectingErrors();
  }, []);

  return null;
}
