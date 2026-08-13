import { ImageResponse } from 'next/og';
import { PRODUCT } from '@/lib/site';

// Rendered once at build time. Without this, `output: 'export'` treats it as a
// request-time route and refuses.
export const dynamic = 'force-static';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${PRODUCT} — build a portfolio site you own outright`;

/**
 * The card that appears when somebody pastes the address into Slack or a
 * message.
 *
 * Set in the sans face rather than the didone the site uses, deliberately: a
 * social card is read at about the size of a postage stamp in a feed, and a
 * high-contrast display serif is the first thing to fall apart at that size.
 * The line here is the third headline candidate from the research — rejected
 * for the page because it assumes an argument the reader has to already agree
 * with, and the best of the three at this size for exactly the same reason.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0c1512',
        color: '#e8eee9',
        padding: 72,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Upper-cased here rather than written out, so the name has exactly one
          source. Spelling it literally is how this card kept the old name after
          everything else had changed: a grep for the name in its normal casing
          does not find a shouted one. */}
      <div style={{ display: 'flex', fontSize: 26, letterSpacing: 2, color: '#6fcb9f' }}>
        {PRODUCT.toUpperCase()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', fontSize: 86, lineHeight: 1.05, fontWeight: 700 }}>
          Professional portfolio websites. Without the rent.
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#aab8b1' }}>
          Free, open source, self-hosted. Your content, your database, your domain.
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 24, color: '#6fcb9f', letterSpacing: 1 }}>
        MIT LICENSED · NO ACCOUNT · NOTHING TO CANCEL
      </div>
    </div>,
    size
  );
}
