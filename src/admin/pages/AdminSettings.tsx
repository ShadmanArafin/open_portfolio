import React, { useMemo, useRef, useState } from 'react';
import { Selector, TextArea, TextInput } from '../components/AdminFields';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { useLocation } from 'react-router-dom';
import { useCMS } from '../../cms/context/CMSContext';
import { cmsService } from '../../cms/services/cmsService';
import { GOOGLE_FONTS_LIST } from '../../utils/googleFonts';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { SocialLinkItem } from '../../cms/types/cms';
import {
  SOCIAL_PLATFORMS,
  getSocialPlatform,
  buildSocialUrl,
  extractSocialHandle,
} from '../../cms/data/socialPlatforms';
import { Text } from '@astryxdesign/core/Text';
import { useAdminFont, AdminFont } from '../context/AdminFontContext';
import {
  AstryxHeader,
  AstryxCard,
  AstryxButton,
  AstryxField,
} from '../components/astryx/AstryxComponents';
import {
  Palette,
  Type,
  Plus,
  Globe,
  BookOpen,
  Search,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { inputClass, textareaClass } from '../utils/listOps';

type PanelId = 'general' | 'footer' | 'microcopy' | 'appearance' | 'seo';

const PANEL_META: Record<PanelId, { badge: string; title: string; subtitle: string }> = {
  general: {
    badge: 'General',
    title: 'Site Settings & Backup',
    subtitle:
      'Your name, contact details, the About story, and tools to back up or restore all content.',
  },
  footer: {
    badge: 'Footer & social',
    title: 'Footer & Social Links',
    subtitle:
      'Copyright line, oversized footer word, and the social cards shown at the bottom of every page.',
  },
  microcopy: {
    badge: 'Microcopy',
    title: 'Buttons, Labels & Small Text',
    subtitle:
      'Every short string on the site that is not a heading or body paragraph. Search to jump to one.',
  },
  appearance: {
    badge: 'Appearance',
    title: 'Colours & Typography',
    subtitle:
      'Accent colours per theme, background tones, and the Google Fonts used for headings and body text.',
  },
  seo: {
    badge: 'SEO',
    title: 'Search & Social Previews',
    subtitle:
      'Page title, meta description, and the image used when a link to your site is shared.',
  },
};

function panelFromPath(pathname: string): PanelId {
  if (pathname.includes('/footer')) return 'footer';
  if (pathname.includes('/microcopy')) return 'microcopy';
  if (pathname.includes('/appearance')) return 'appearance';
  if (pathname.includes('/seo')) return 'seo';
  return 'general';
}

/** Turn a camelCase key into a readable label. */
function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

const FONT_OPTIONS = GOOGLE_FONTS_LIST.map((font) => ({
  value: font.name,
  label: `${font.name} (${font.category})`,
}));

/** The label font may be left unset, which keeps the system monospace stack. */
const MONO_FONT_OPTIONS = [{ value: '', label: 'System monospace (default)' }, ...FONT_OPTIONS];

export const AdminSettings: React.FC = () => {
  const location = useLocation();
  const panel = panelFromPath(location.pathname);
  const meta = PANEL_META[panel];

  return (
    <VStack gap={6}>
      <AstryxHeader badgeText={meta.badge} title={meta.title} subtitle={meta.subtitle} />

      {panel === 'general' && <GeneralPanel />}
      {panel === 'footer' && <FooterPanel />}
      {panel === 'microcopy' && <MicrocopyPanel />}
      {panel === 'appearance' && <AppearancePanel />}
      {panel === 'seo' && <SEOPanel />}
    </VStack>
  );
};

/* =================================================================== */
/* GENERAL — identity, contact, about story, backup                    */
/* =================================================================== */

const GeneralPanel: React.FC = () => {
  const { draftData, updateDraft, isDurable, storeName } = useCMS();
  const settings = draftData.settings;

  const set = (field: string, val: unknown) =>
    updateDraft((draft) => {
      (draft.settings as any)[field] = val;
    });

  const aboutStoryText = (settings.aboutStoryParagraphs ?? []).join('\n\n');

  return (
    <>
      {!isDurable && (
        <AstryxCard variant="default" className="border-[var(--color-border-yellow)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--color-text-yellow)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-text-primary">Content is not being saved</h3>
              <p className="text-sm text-text-secondary mt-1">
                Browser storage is unavailable in this window, so every edit is lost on refresh.
                This usually means private browsing or blocked site data.
              </p>
            </div>
          </div>
        </AstryxCard>
      )}

      <AstryxCard variant="default" density="balanced" className="space-y-6">
        <SectionTitle icon={BookOpen} text="Identity & contact" />

        <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
          <TextInput
            label="Full name"
            value={settings.fullName}
            onChange={(_value, e) => set('fullName', e.target.value)}
            width="100%"
          />

          <TextInput
            label="Role / title"
            value={settings.role}
            onChange={(_value, e) => set('role', e.target.value)}
            width="100%"
          />

          <TextInput
            label="Location"
            value={settings.location}
            onChange={(_value, e) => set('location', e.target.value)}
            width="100%"
          />

          <TextInput
            label="Email"
            value={settings.email}
            onChange={(_value, e) => set('email', e.target.value)}
            type="email"
            width="100%"
          />

          <TextInput
            label="WhatsApp number"
            value={settings.whatsappNumber}
            onChange={(_value, e) => set('whatsappNumber', e.target.value)}
            width="100%"
          />

          <TextInput
            label="WhatsApp display format"
            value={settings.whatsappFormatted}
            onChange={(_value, e) => set('whatsappFormatted', e.target.value)}
            width="100%"
          />

          <div className="sm:col-span-2">
            <TextInput
              label="WhatsApp link"
              value={settings.whatsappUrl}
              onChange={(_value, e) => set('whatsappUrl', e.target.value)}
              width="100%"
            />
          </div>

          <div className="sm:col-span-2">
            <TextInput
              label="Availability status"
              value={settings.availabilityStatus}
              onChange={(_value, e) => set('availabilityStatus', e.target.value)}
              width="100%"
            />
          </div>
        </Grid>
      </AstryxCard>

      <AstryxCard variant="default" density="balanced" className="space-y-6">
        <SectionTitle icon={BookOpen} text="About story" />

        <TextInput
          label="About headline"
          value={settings.aboutHeading ?? ''}
          onChange={(_value, e) => set('aboutHeading', e.target.value)}
          width="100%"
        />

        <TextArea
          label="About paragraphs"
          value={aboutStoryText}
          onChange={(_value, e) =>
            set(
              'aboutStoryParagraphs',
              e.target.value.split(/\n\s*\n/).filter((p) => p.trim() !== '')
            )
          }
          description="Leave a blank line between paragraphs."
          rows={6}
          width="100%"
        />
      </AstryxCard>

      <BackupPanel storeName={storeName} />
    </>
  );
};

/* =================================================================== */
/* BACKUP — export / import / reset                                    */
/* =================================================================== */

const BackupPanel: React.FC<{ storeName: string }> = ({ storeName }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const bundle = await cmsService.exportBundle();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-content-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(
        `Exported ${bundle.media.length} media file${bundle.media.length === 1 ? '' : 's'} and all content.`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!window.confirm('Importing replaces ALL current content and media. Continue?')) return;

    setBusy(true);
    try {
      const parsed = JSON.parse(await file.text());
      const result = await cmsService.importBundle(parsed);
      setStatus(
        result.ok ? 'Content restored from the bundle.' : (result.error ?? 'Import failed.')
      );
    } catch {
      setStatus('That file could not be read as JSON.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'This deletes all your edits and uploaded images, restoring the original built-in content. Continue?'
      )
    )
      return;
    if (
      !window.confirm(
        'Last chance — this cannot be undone. Export a backup first if you are unsure.'
      )
    )
      return;

    setBusy(true);
    try {
      await cmsService.resetToSeed();
      setStatus('Content reset to the built-in defaults.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AstryxCard variant="default" density="balanced" className="space-y-5">
      <SectionTitle icon={HardDrive} text="Backup & restore" />

      <p className="text-sm text-text-secondary leading-relaxed">
        Content currently lives in <span className="text-text-primary">{storeName}</span>, which
        means it exists only in this browser on this computer. Export regularly — the file is both
        your backup and the way to move content to another machine.
      </p>

      <div className="flex flex-wrap gap-3">
        <AstryxButton
          variant="primary"
          icon={Download}
          onClick={() => void handleExport()}
          disabled={busy}
        >
          Export Content
        </AstryxButton>

        <AstryxButton
          variant="secondary"
          icon={Upload}
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          Import Bundle
        </AstryxButton>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void handleImport(e)}
        />

        <AstryxButton
          variant="danger"
          icon={RotateCcw}
          onClick={() => void handleReset()}
          disabled={busy}
        >
          Reset to Defaults
        </AstryxButton>
      </div>

      {status && <p className="text-xs text-accent">{status}</p>}
    </AstryxCard>
  );
};

/* =================================================================== */
/* FOOTER & SOCIALS                                                    */
/* =================================================================== */

const SOCIAL_OPTIONS = SOCIAL_PLATFORMS.map((p) => ({ value: p.id, label: p.name }));

/**
 * One social card.
 *
 * Asking for a platform *name* as free text meant the icon could never be
 * looked up — the footer fell back to the LinkedIn glyph for everything. The
 * platform is a fixed set, so it is a picker, and the only thing left to type
 * is the part that is actually personal: the handle. A pasted profile URL
 * works just as well, since that is what most people reach for.
 */
const SocialCardEditor: React.FC<{ link: SocialLinkItem; index: number }> = ({ link, index }) => {
  const { updateDraft } = useCMS();
  const platform = getSocialPlatform(link.iconType);
  const Icon = platform.icon;
  const handle = extractSocialHandle(link.iconType, link.url);

  const setPlatform = (id: string) =>
    updateDraft((draft) => {
      const next = draft.socialLinks[index];
      const current = extractSocialHandle(next.iconType, next.url);
      next.iconType = id as SocialLinkItem['iconType'];
      next.label = getSocialPlatform(id).name.toUpperCase();
      next.url = buildSocialUrl(id, current);
    });

  const setHandle = (value: string) =>
    updateDraft((draft) => {
      const next = draft.socialLinks[index];
      next.url = buildSocialUrl(next.iconType, value);
      if (!next.name) next.name = value.replace(/^@/, '');
    });

  return (
    <AdminRecord
      value={link.id}
      title={platform.name}
      summary={link.url || 'No link yet'}
      media={<Icon aria-hidden size={18} />}
      onRemove={() =>
        updateDraft((draft) => {
          draft.socialLinks.splice(index, 1);
        })
      }
      removeLabel="Remove link"
    >
      <VStack gap={4}>
        <Selector
          label="Platform"
          value={link.iconType}
          options={SOCIAL_OPTIONS}
          onChange={(value) => setPlatform(String(value))}
          width="100%"
        />

        <TextInput
          label="Username or profile link"
          description={link.url || `Saved as ${platform.baseUrl ?? 'the link you paste'}…`}
          placeholder={platform.placeholder}
          value={handle}
          onChange={(_value, e) => setHandle(e.target.value)}
          width="100%"
        />

        <TextInput
          label="Card caption"
          description="The name shown under the icon on the footer card."
          value={link.name}
          onChange={(_value, e) =>
            updateDraft((draft) => {
              draft.socialLinks[index].name = e.target.value;
            })
          }
          width="100%"
        />
      </VStack>
    </AdminRecord>
  );
};

const FooterPanel: React.FC = () => {
  const { draftData, updateDraft } = useCMS();

  const setSetting = (field: string, val: unknown) =>
    updateDraft((draft) => {
      (draft.settings as any)[field] = val;
    });

  const setAppearance = (field: string, val: unknown) =>
    updateDraft((draft) => {
      (draft.appearance as any)[field] = val;
    });

  const socials = draftData.socialLinks ?? [];

  return (
    <>
      <AstryxCard variant="default" density="balanced" className="space-y-6">
        <SectionTitle icon={Globe} text="Footer" />

        <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
          <TextInput
            label="Copyright text"
            value={draftData.settings.copyrightText}
            onChange={(_value, e) => setSetting('copyrightText', e.target.value)}
            width="100%"
          />

          <TextInput
            label="Oversized footer word"
            value={draftData.appearance?.giantFooterText ?? ''}
            onChange={(_value, e) => setAppearance('giantFooterText', e.target.value)}
            width="100%"
          />
        </Grid>
      </AstryxCard>

      <AstryxCard variant="default" density="balanced" className="space-y-5">
        <HStack justify="between" align="center">
          <SectionTitle icon={Globe} text={`Social cards (${socials.length})`} />
          <AstryxButton
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() =>
              updateDraft((draft) => {
                draft.socialLinks.push({
                  id: `social-${Date.now()}`,
                  label: 'LINKEDIN',
                  name: '',
                  url: '',
                  iconType: 'linkedin',
                  visible: true,
                  sortOrder: draft.socialLinks.length + 1,
                });
              })
            }
          >
            Add Social
          </AstryxButton>
        </HStack>

        <AdminRecordList>
          {socials.map((s, idx) => (
            <SocialCardEditor key={s.id} link={s} index={idx} />
          ))}
        </AdminRecordList>
      </AstryxCard>
    </>
  );
};

/* =================================================================== */
/* MICROCOPY — searchable list of every short string                   */
/* =================================================================== */

const MicrocopyPanel: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const [query, setQuery] = useState('');

  const entries = useMemo(() => {
    const all = Object.entries(draftData.microcopy ?? {}) as [string, string][];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      ([key, value]) => key.toLowerCase().includes(q) || value.toLowerCase().includes(q)
    );
  }, [draftData.microcopy, query]);

  return (
    <AstryxCard variant="default" density="balanced" className="space-y-5">
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search labels and text…"
          className={`${inputClass} pl-9`}
        />
      </div>

      <p className="text-xs text-text-muted">
        {entries.length} of {Object.keys(draftData.microcopy ?? {}).length} strings
      </p>

      <VStack gap={3}>
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-2 sm:gap-4 sm:items-center"
          >
            <label htmlFor={`mc-${key}`} className="text-xs text-text-muted">
              {humanise(key)}
            </label>
            <input
              id={`mc-${key}`}
              type="text"
              value={value}
              onChange={(e) =>
                updateDraft((draft) => {
                  (draft.microcopy as any)[key] = e.target.value;
                })
              }
              className={inputClass}
            />
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-text-secondary">No strings match “{query}”.</p>
        )}
      </VStack>
    </AstryxCard>
  );
};

/* =================================================================== */
/* APPEARANCE                                                          */
/* =================================================================== */

const COLOR_FIELDS: { field: string; label: string; fallback: string }[] = [
  { field: 'accentDark', label: 'Accent — dark mode', fallback: '#35F2B3' },
  { field: 'accentLight', label: 'Accent — light mode', fallback: '#00B97D' },
  { field: 'backgroundDark', label: 'Background — dark mode', fallback: '#0D0F0F' },
  { field: 'backgroundLight', label: 'Background — light mode', fallback: '#F3F3EF' },
  { field: 'strokeDark', label: 'Border — dark mode', fallback: '#1B1B1B' },
  { field: 'strokeLight', label: 'Border — light mode', fallback: '#DADADA' },
];

const PRESETS: { name: string; accentDark: string; accentLight: string; bgDark: string }[] = [
  { name: 'Emerald Mint', accentDark: '#35F2B3', accentLight: '#00B97D', bgDark: '#0D0F0F' },
  { name: 'Electric Blue', accentDark: '#3B82F6', accentLight: '#2563EB', bgDark: '#0B0F17' },
  { name: 'Magenta Rose', accentDark: '#EC4899', accentLight: '#DB2777', bgDark: '#110C13' },
  { name: 'Amber Gold', accentDark: '#F59E0B', accentLight: '#D97706', bgDark: '#12100B' },
];

const AppearancePanel: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const appearance = draftData.appearance;

  const set = (field: string, val: unknown) =>
    updateDraft((draft) => {
      (draft.appearance as any)[field] = val;
    });

  return (
    <>
      <AstryxCard variant="default" density="balanced" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={Palette} text="Colour tokens" />
          <HStack gap={2} align="center">
            <span className="text-[length:var(--font-size-sm)] text-text-muted">Presets</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  set('accentDark', preset.accentDark);
                  set('accentLight', preset.accentLight);
                  set('backgroundDark', preset.bgDark);
                }}
                className="w-5 h-5 rounded-full border border-border cursor-pointer"
                style={{ backgroundColor: preset.accentDark }}
                title={preset.name}
                aria-label={`Apply ${preset.name} preset`}
              />
            ))}
          </HStack>
        </div>

        <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
          {COLOR_FIELDS.map(({ field, label, fallback }) => {
            const value = (appearance as any)?.[field] ?? fallback;
            return (
              <div
                key={field}
                className="p-3.5 rounded-xl bg-[var(--color-background-muted)] border border-border space-y-2"
              >
                <label className="text-[length:var(--font-size-sm)] text-text-muted block">
                  {label}
                </label>
                <HStack gap={3} align="center">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => set(field, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                    aria-label={`${label} colour picker`}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(field, e.target.value)}
                    className="flex-grow px-3 py-2 rounded-lg bg-surface-primary border border-border text-xs text-text-primary outline-none"
                  />
                </HStack>
              </div>
            );
          })}
        </Grid>
      </AstryxCard>

      <AstryxCard variant="default" density="balanced" className="space-y-6">
        <SectionTitle icon={Type} text="Typography" />

        <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
          <AstryxField label="Heading font">
            <Selector
              label="Heading font"
              isLabelHidden
              value={appearance?.displayFontFamily ?? 'Instrument Serif'}
              options={FONT_OPTIONS}
              onChange={(value) => set('displayFontFamily', value)}
              hasSearch
              width="100%"
            />
          </AstryxField>

          <AstryxField label="Body font">
            <Selector
              label="Body font"
              isLabelHidden
              value={appearance?.bodyFontFamily ?? 'Geist'}
              options={FONT_OPTIONS}
              onChange={(value) => set('bodyFontFamily', value)}
              hasSearch
              width="100%"
            />
          </AstryxField>

          <AstryxField
            label="Label font"
            info="Used for the small caps labels — section eyebrows, numbers and metadata."
          >
            <Selector
              label="Label font"
              isLabelHidden
              value={appearance?.monoFontFamily ?? ''}
              options={MONO_FONT_OPTIONS}
              onChange={(value) => set('monoFontFamily', value)}
              hasSearch
              width="100%"
            />
          </AstryxField>
        </Grid>
      </AstryxCard>

      <EditorTypefacePanel />
    </>
  );
};

/* =================================================================== */
/* EDITOR TYPEFACE — admin only                                        */
/* =================================================================== */

/**
 * Sits under Appearance next to the site fonts, but changes only the admin.
 * Kept visually separate and clearly labelled, because "which font does this
 * change?" is exactly the question a fonts panel invites.
 */
const EditorTypefacePanel: React.FC = () => {
  const { font, setFont, options } = useAdminFont();

  return (
    <AstryxCard variant="surface" density="balanced" className="space-y-4">
      <SectionTitle icon={Type} text="Editor typeface" />

      <Text type="supporting" display="block">
        The font used by this admin panel only. It does not affect your website or the draft
        preview, and is never published or exported.
      </Text>

      <SegmentedControl
        label="Editor typeface"
        value={font}
        onChange={(value) => setFont(value as AdminFont)}
      >
        {options.map((option) => (
          <SegmentedControlItem key={option.id} value={option.id} label={option.label} />
        ))}
      </SegmentedControl>

      <Text type="supporting" display="block">
        {options.find((o) => o.id === font)?.note}
      </Text>
    </AstryxCard>
  );
};

/* =================================================================== */
/* SEO                                                                 */
/* =================================================================== */

const SEOPanel: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const seo = draftData.seo;

  const set = (field: string, val: unknown) =>
    updateDraft((draft) => {
      (draft.seo as any)[field] = val;
    });

  const descriptionLength = seo?.metaDescription?.length ?? 0;

  return (
    <AstryxCard variant="default" density="balanced" className="space-y-6">
      <SectionTitle icon={Search} text="Search engine listing" />

      <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
        <TextInput
          label="Site title"
          value={seo?.siteTitle ?? ''}
          onChange={(_value, e) => set('siteTitle', e.target.value)}
          width="100%"
        />

        <TextInput
          label="Title template"
          value={seo?.titleTemplate ?? ''}
          onChange={(_value, e) => set('titleTemplate', e.target.value)}
          description="%s is replaced by the page name."
          width="100%"
        />
      </Grid>

      <AstryxField
        label="Meta description"
        info={`${descriptionLength} characters. Search engines usually show around 155.`}
      >
        <textarea
          rows={3}
          value={seo?.metaDescription ?? ''}
          onChange={(e) => set('metaDescription', e.target.value)}
          className={textareaClass}
        />
      </AstryxField>

      <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
        <TextInput
          label="Canonical URL"
          value={seo?.canonicalUrl ?? ''}
          onChange={(_value, e) => set('canonicalUrl', e.target.value)}
          width="100%"
        />

        <TextInput
          label="Share image"
          value={seo?.ogImage ?? ''}
          onChange={(_value, e) => set('ogImage', e.target.value)}
          description="Shown when a link to your site is posted."
          width="100%"
        />

        <TextInput
          label="Author"
          value={seo?.author ?? ''}
          onChange={(_value, e) => set('author', e.target.value)}
          width="100%"
        />

        <TextInput
          label="Robots"
          value={seo?.robots ?? ''}
          onChange={(_value, e) => set('robots', e.target.value)}
          description="Use “noindex, nofollow” to hide the site from search engines."
          width="100%"
        />
      </Grid>
    </AstryxCard>
  );
};

/* =================================================================== */

const SectionTitle: React.FC<{ icon: React.ElementType; text: string }> = ({
  icon: Icon,
  text,
}) => (
  <span className="text-xs text-accent font-medium flex items-center gap-2">
    <Icon className="w-4 h-4" />
    <span>{text}</span>
  </span>
);
