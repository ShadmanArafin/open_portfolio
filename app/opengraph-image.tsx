import { ImageResponse } from 'next/og';
import { getContentForChannel } from '@/core/content/read';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Portfolio preview';

export default async function Image() {
  const content = await getContentForChannel('published');
  const name = content.settings.fullName || content.seo.siteTitle || 'Portfolio';
  const role = content.settings.role || 'Design & Engineering';
  const location = content.settings.location || '';
  const tagline =
    content.seo.metaDescription ||
    content.settings.aboutHeading ||
    'Selected work, design explorations, and writings.';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#090a0f',
        color: '#f4f4f5',
        padding: '64px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        border: '12px solid #181920',
        boxSizing: 'border-box',
      }}
    >
      {/* Top: Availability / Identity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #27272a',
          paddingBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ fontSize: '18px', color: '#10b981', fontWeight: 600 }}>
            {content.settings.availabilityStatus || 'Available for projects'}
          </span>
        </div>
        {location ? <span style={{ fontSize: '18px', color: '#71717a' }}>{location}</span> : null}
      </div>

      {/* Center: Large Name and Role */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 'auto 0' }}>
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            margin: 0,
            color: '#ffffff',
          }}
        >
          {name}
        </h1>

        <div
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#10b981',
            letterSpacing: '-0.02em',
          }}
        >
          {role}
        </div>

        <p
          style={{
            fontSize: '22px',
            lineHeight: 1.45,
            color: '#a1a1aa',
            margin: '8px 0 0 0',
            maxWidth: '900px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Bottom: Site branding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #27272a',
          paddingTop: '24px',
          fontSize: '18px',
          color: '#71717a',
        }}
      >
        <span style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
          {content.seo.siteTitle || 'OPEN PORTFOLIO'}
        </span>
        <span style={{ color: '#a1a1aa' }}>
          {content.settings.siteUrl ? content.settings.siteUrl.replace(/^https?:\/\//, '') : ''}
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
