import type { Metadata } from 'next';
import Link from 'next/link';
import { getContentForChannel } from '@/core/content/read';
import { currentChannel } from '@/core/pages/read';
import { buildMetadata } from '@/core/content/metadata';
import { resolveLinkInBio } from '@/core/content/link-in-bio';
import { ArrowUpRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContentForChannel('published');
  const who = content.settings.fullName;
  return buildMetadata({
    title: `${who} — Links`,
    description: `Connect with ${who}: social links, portfolio projects, and resume.`,
    path: '/bio',
  });
}

export default async function BioPage() {
  const channel = await currentChannel();
  const content = await getContentForChannel(channel);
  const profile = resolveLinkInBio(content);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        {/* Avatar */}
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-border shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto bg-surface-secondary border-2 border-border flex items-center justify-center font-display text-2xl font-semibold text-text-primary">
            {profile.name.charAt(0)}
          </div>
        )}

        {/* Identity */}
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary">
            {profile.name}
          </h1>
          {profile.role && (
            <p className="font-body text-sm font-medium text-text-secondary">{profile.role}</p>
          )}
          {profile.bio && (
            <p className="font-body text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links Stack */}
        <div className="space-y-3 pt-2">
          {profile.links.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className={`group flex items-center justify-between w-full px-5 py-3.5 rounded-2xl font-body text-sm font-medium transition-all duration-200 border ${
                link.highlight
                  ? 'bg-text-primary text-bg border-text-primary hover:opacity-90 shadow-sm'
                  : 'bg-surface-primary text-text-primary border-border hover:border-text-primary/40 hover:bg-surface-secondary'
              }`}
            >
              <span className="truncate">{link.label}</span>
              <ArrowUpRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 ${
                  link.highlight ? 'text-bg' : 'text-text-muted'
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Socials Row */}
        {profile.socials.length > 0 && (
          <div className="pt-4 border-t border-border flex flex-wrap justify-center gap-3">
            {profile.socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full border border-border bg-surface-secondary text-xs font-body text-text-secondary hover:text-text-primary hover:border-text-primary/40 transition-colors"
              >
                {social.label || social.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
