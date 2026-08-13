import React from 'react';
import Link from 'next/link';
import { PRODUCT, VERSION } from '@/lib/site';

/**
 * The demo's own bar, in place of the site's.
 *
 * The product name on the left is the only marketing left on this route,
 * deliberately: everything below it is the admin, and a visitor deciding
 * whether they could work it should be looking at the admin and not at a nav
 * bar offering them nine other pages.
 *
 * "Exit demo" rather than a back arrow or the site logo linking home. The
 * demo signs you in to something that looks like your own admin, and the way
 * out of an application is a labelled exit — an unlabelled logo that silently
 * abandons what you were doing is the thing people learn to distrust.
 */
export function DemoTopBar() {
  return (
    <header className="demobar">
      <div className="demobar__left">
        <span className="demobar__brand">{PRODUCT}</span>
        <span className="demobar__chip">Demo v{VERSION}</span>
        <span className="demobar__note">Nothing is saved and nothing is sent</span>
      </div>

      <div className="demobar__right">
        <Link className="demobar__link" href="/demo">
          What this is
        </Link>
        <Link className="demobar__link" href="/deploy">
          Deploy your own
        </Link>
        <Link className="demobar__exit" href="/demo">
          Exit demo
        </Link>
      </div>
    </header>
  );
}
