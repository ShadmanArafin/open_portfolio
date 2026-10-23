import { siteNow } from '@/core/content/now';
import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getContentForChannel } from '@/core/content/read';
import { publicView } from '@/core/content/sanitise';
import { blockContentFrom } from '@/core/blocks/content';
import { currentChannel } from '@/core/pages/read';
import { formatPeriod } from '@/cms/utils/dates';
import { PrintButton } from './print-button';

/**
 * `/cv` — the experience, education and skills already on the site, as one
 * plain page a hiring manager can read in a minute or print.
 *
 * Nothing new to fill in: it is built from the same records the theme shows,
 * in the same order, hidden ones left out. The print stylesheet turns it (and
 * any other page) into clean black on white, so "Save as PDF" in the browser
 * is the PDF export, with nothing to keep in step.
 */

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContentForChannel('published');
  const who = content.settings.fullName;
  return buildMetadata({
    title: 'CV',
    description: `${who}${content.settings.role ? `, ${content.settings.role}` : ''}: experience, education and skills.`,
    path: '/cv',
  });
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
  margin: 0,
};
const h2: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-2xl)',
  margin: 0,
  paddingBottom: 'var(--space-2)',
  borderBottom: 'var(--hairline) solid var(--border-color)',
};
const body: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  color: 'var(--text-secondary)',
  margin: 0,
};

export default async function CvPage() {
  const content = publicView(await getContentForChannel(await currentChannel()), await siteNow());
  const { experience, education, capabilityGroups } = blockContentFrom(content, await siteNow());
  const { settings } = content;

  return (
    <article
      data-cv
      style={{
        maxWidth: 'var(--container-default)',
        marginInline: 'auto',
        paddingInline: 'var(--gutter)',
        paddingBlock: 'var(--section-y)',
        display: 'grid',
        gap: 'var(--space-10)',
      }}
    >
      <header style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            margin: 0,
          }}
        >
          {settings.fullName}
        </h1>
        {settings.role ? (
          <p style={{ ...body, fontSize: 'var(--text-lg)' }}>{settings.role}</p>
        ) : null}
        <p style={body}>
          {[settings.location, settings.email, settings.siteUrl].filter(Boolean).join(' · ')}
        </p>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <PrintButton />
        </div>
      </header>

      {experience.length > 0 ? (
        <section style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <h2 style={h2}>Experience</h2>
          {experience.map((item) => (
            <div
              key={item.id}
              style={{ display: 'grid', gap: 'var(--space-2)', breakInside: 'avoid' }}
            >
              <p style={eyebrow}>
                {formatPeriod(item) || item.period}
                {item.type ? ` · ${item.type}` : ''}
              </p>
              <h3
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', margin: 0 }}
              >
                {item.role}
                {item.company ? `, ${item.company}` : ''}
              </h3>
              {item.summary ? <p style={body}>{item.summary}</p> : null}
              {item.highlights?.length ? (
                <ul
                  style={{
                    ...body,
                    paddingInlineStart: '1.25em',
                    display: 'grid',
                    gap: 'var(--space-1)',
                  }}
                >
                  {item.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {education.length > 0 ? (
        <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <h2 style={h2}>Education</h2>
          {education.map((item) => (
            <div
              key={item.id}
              style={{ display: 'grid', gap: 'var(--space-1)', breakInside: 'avoid' }}
            >
              <p style={eyebrow}>
                {item.yearLabel}
                {item.status ? ` · ${item.status}` : ''}
              </p>
              <h3
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', margin: 0 }}
              >
                {item.degree}
              </h3>
              <p style={body}>{item.institution}</p>
            </div>
          ))}
        </section>
      ) : null}

      {capabilityGroups.length > 0 ? (
        <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <h2 style={h2}>Skills</h2>
          {capabilityGroups.map((group) => (
            <div
              key={group.id}
              style={{ display: 'grid', gap: 'var(--space-1)', breakInside: 'avoid' }}
            >
              <h3
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', margin: 0 }}
              >
                {group.title}
              </h3>
              <p style={body}>{group.capabilities.join(' · ')}</p>
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );
}
