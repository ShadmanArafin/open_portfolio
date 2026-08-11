'use client';

import React, { useEffect, useState } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/Layout';

/**
 * "Add this to your home screen."
 *
 * Worth more than it looks. Chrome began automatically revoking notification
 * permission from low-engagement sites in October 2025 and exempts installed
 * web apps; iOS delivers web push only to a site that has been added to the
 * Home Screen. Installing is therefore the precondition for ever telling
 * somebody an enquiry arrived — not a nicety.
 *
 * Two paths, because the platforms genuinely differ:
 *
 * - **Android and desktop Chrome** fire `beforeinstallprompt`, which can be
 *   saved and replayed against a real button. The event is only fired once, so
 *   it has to be caught before anything else can consume it.
 * - **iOS fires nothing at all.** There is no API, and there never has been —
 *   the only route is Share → Add to Home Screen, which means the honest
 *   version of this on an iPhone is instructions rather than a button. A
 *   button that silently does nothing is worse than no button.
 *
 * Shown once and dismissible. Nagging somebody about installing an app is how
 * a useful prompt becomes something people learn to swipe away.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'opb.install.dismissed';

export const InstallPrompt: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Already installed: `standalone` is the display mode an installed app runs
    // in, and iOS exposes its own legacy flag for the same thing.
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    const hidden = localStorage.getItem(DISMISSED_KEY) === '1';
    if (installed || hidden) return;

    setDismissed(false);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (event: Event) => {
      // Chrome shows its own bar unless this is prevented, and that bar cannot
      // be placed where it makes sense or explained.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const hide = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  if (dismissed) return null;
  // Nothing to offer: not iOS, and the browser has not said it can install.
  if (!deferred && !isIos) return null;

  return (
    <Banner
      status="info"
      title="Put this on your home screen"
      description={
        isIos
          ? 'Tap the Share button, then "Add to Home Screen". It opens like an app, and it is the only way iPhones will let this notify you when somebody writes to you.'
          : 'It opens like an app, and installed apps keep permission to notify you when somebody writes to you — browsers now take that away from sites you rarely visit.'
      }
    >
      <HStack gap={2}>
        {deferred && (
          <Button
            variant="primary"
            size="sm"
            label="Install"
            onClick={() => {
              void deferred.prompt().then(() => {
                setDeferred(null);
                hide();
              });
            }}
          />
        )}
        <Button variant="ghost" size="sm" label="Not now" onClick={hide} />
      </HStack>
    </Banner>
  );
};
