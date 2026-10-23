'use client';

import { formatYearRange, yearOptions } from '@/cms/utils/dates';
import { normaliseSlug } from '@/core/pages/schema';
import type { MediaItem, ProjectImageItem, ProjectItem } from '@/cms/types/cms';
import { updateProjectsAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { projectsCsv } from '@/core/import/csv-templates';
import { CheckField, Field, SelectField } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { ImageField } from '../_components/image-field';
import { BlocksEditor } from '../_components/blocks-editor';

/**
 * Selected work.
 *
 * The list is the screen: order is the order on the site, and everything is
 * local until Save. The legacy screen saved on every keystroke and kept a
 * "Save" button that only stamped a timestamp; here the button is the save,
 * and it writes the whole list in one revision-checked call.
 *
 * The fields are the legacy screen's fields, with three deliberate additions
 * the old one could not make: the web address is editable (every project used
 * to be created with a date-stamped slug nobody could change), the short name
 * is editable (it labels "next project" links and was frozen at "New
 * project"), and an image can be described (the seed screenshots carry alt
 * text, but nothing let a person write their own).
 */

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft — only you can see it' },
  { value: 'published', label: 'Published — anyone can see it' },
  { value: 'archived', label: 'Archived — hidden, but kept' },
];

const YEARS = yearOptions();
const YEAR_OPTIONS = [
  { value: '', label: 'Not set' },
  ...YEARS.map((year) => ({ value: year, label: year })),
];
const IMAGE_LABELS = ['01 / OVERVIEW', '02 / EDITORIAL', '03 / INTERFACE', '04 / PORTAL'];

function uniqueSlug(base: string, items: ProjectItem[]): string {
  let slug = base;
  for (let n = 2; items.some((item) => item.slug === slug); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

function createProject(items: ProjectItem[]): ProjectItem {
  return {
    id: newId('proj'),
    slug: uniqueSlug('new-project', items),
    number: String(items.length + 1).padStart(2, '0'),
    title: 'New project',
    name: 'New project',
    company: '',
    category: '',
    year: String(new Date().getFullYear()),
    shortDescription: 'One-line summary shown on project cards.',
    description: ['Project overview description paragraph 1.'],
    heroHeadline: 'Headline shown at the top of the project page.',
    role: '',
    deliverables: [],
    industry: '',
    timeline: '',
    platform: '',
    featured: true,
    // The array order carries the order; the server renumbers on save.
    sortOrder: 0,
    status: 'draft',
    visualPlaceholder: 'from-emerald-950 via-zinc-900 to-black',
    // Empty, not borrowed. These used to carry Apex's URL and screenshots, so
    // a new project published with another client's work attached.
    liveUrl: '',
    siteUrl: '',
    companyUrl: '',
    images: IMAGE_LABELS.map((label) => ({ id: newId('img'), label, alt: '', url: '' })),
    overview: ['Overview paragraph shown on the project detail page.'],
    challenge: 'What problem did this project set out to solve?',
    approachSteps: [{ title: 'Discovery', description: 'How the work started.' }],
    keyScreensCount: 0,
    outcomeNote: '',
  };
}

function duplicateProject(item: ProjectItem, items: ProjectItem[]): ProjectItem {
  return {
    ...structuredClone(item),
    id: newId('proj'),
    slug: uniqueSlug(`${item.slug}-copy`, items),
    title: `${item.title} (Copy)`,
    name: `${item.name} (Copy)`,
    status: 'draft',
    sortOrder: 0,
  };
}

/** The four slots always exist, even for a record stored with fewer. */
function withImage(
  project: ProjectItem,
  index: number,
  patch: Partial<ProjectImageItem>
): ProjectItem {
  const images = [...(project.images ?? [])];
  images[index] = {
    ...(images[index] ?? {
      id: newId('img'),
      label: IMAGE_LABELS[index] ?? `Image ${index + 1}`,
      alt: '',
    }),
    ...patch,
  };
  return { ...project, images };
}

export function ProjectsBuilder({
  initialProjects,
  media = [],
  token,
}: {
  initialProjects: ProjectItem[];
  media?: MediaItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<ProjectItem>
      token={token}
      initialItems={initialProjects}
      addLabel="Add project"
      emptyTitle="No projects yet."
      emptyHint="A project becomes a page at /work/…, and blocks can show your work automatically."
      deleteLabel="Delete project"
      deleteWarning="The project leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(project) => project.title}
      summary={(project) =>
        [project.company, formatYearRange(project)].filter(Boolean).join(' • ') || 'No details yet'
      }
      badge={(project) => ({
        label:
          project.status === 'published'
            ? 'Live'
            : project.status === 'archived'
              ? 'Archived'
              : 'Draft',
        live: project.status === 'published',
      })}
      csv={projectsCsv}
      create={createProject}
      duplicate={duplicateProject}
      save={async (projects, token) => {
        const result = await updateProjectsAction(projects, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.projects,
        };
      }}
      renderFields={(project, mutate, items) => {
        const others = items.filter((other) => other.id !== project.id).map((other) => other.slug);
        const slugProblem =
          project.slug.length === 0
            ? 'Every project needs a web address.'
            : others.includes(project.slug)
              ? 'Another project already uses that address.'
              : null;

        const uploadImage = (index: number) => (media: MediaItem) =>
          mutate((current) => {
            const next = withImage(current, index, { url: media.url });
            const slot = next.images[index];
            if (!slot.alt) slot.alt = `${current.title || 'Project'} image ${index + 1}`;
            return next;
          });

        return (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Project title"
                value={project.title}
                onChange={(value) => mutate((current) => ({ ...current, title: value }))}
              />
              <Field
                label="Short name"
                value={project.name}
                onChange={(value) => mutate((current) => ({ ...current, name: value }))}
                hint="Used for links that point at this project, like “next project” in another one's footer."
              />
              <Field
                label="Client or company"
                value={project.company}
                onChange={(value) => mutate((current) => ({ ...current, company: value }))}
              />
              <Field
                label="Category / industry"
                value={project.category}
                onChange={(value) => mutate((current) => ({ ...current, category: value }))}
              />
              <Field
                label="Role title"
                value={project.role}
                onChange={(value) => mutate((current) => ({ ...current, role: value }))}
              />
              <Field
                label="Live website URL (visit site link)"
                value={project.liveUrl || project.siteUrl || project.companyUrl || ''}
                placeholder="https://example.com"
                onChange={(value) =>
                  mutate((current) => ({
                    ...current,
                    liveUrl: value,
                    siteUrl: value,
                    companyUrl: value,
                  }))
                }
                hint="When pasted, “Visit site” opens this URL in a new tab."
              />
              <SelectField
                label="Status"
                value={project.status}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  mutate((current) => ({
                    ...current,
                    status: value as ProjectItem['status'],
                  }))
                }
              />
              <SelectField
                label="Year from"
                value={project.startYear ?? ''}
                options={YEAR_OPTIONS}
                onChange={(value) =>
                  mutate((current) => ({ ...current, startYear: value || undefined }))
                }
              />
              <SelectField
                label="Year to"
                value={project.endYear ?? ''}
                options={YEAR_OPTIONS}
                onChange={(value) =>
                  mutate((current) => ({ ...current, endYear: value || undefined }))
                }
                hint="Leave empty for a single year."
              />
            </div>

            <Field
              label="Web address"
              value={project.slug}
              onChange={(value) =>
                mutate((current) => ({ ...current, slug: normaliseSlug(value) }))
              }
              hint={`This project will be at /work/${project.slug}`}
              problem={slugProblem}
            />

            <Field
              label="Project overview description"
              value={project.description.join('\n\n')}
              onChange={(value) =>
                mutate((current) => ({ ...current, description: value.split('\n\n') }))
              }
              hint="Blank line between paragraphs."
              rows={4}
            />

            <CheckField
              label="Featured"
              description="Shown by blocks that only display featured work."
              checked={project.featured}
              onChange={(checked) => mutate((current) => ({ ...current, featured: checked }))}
            />

            <section aria-label="Screenshots and assets" className="grid gap-4">
              <h3 className="m-0 text-base">Screenshots &amp; assets</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {IMAGE_LABELS.map((label, index) => {
                  const slot = project.images[index];
                  const alt = slot?.alt ?? '';
                  return (
                    <div key={label} className="grid gap-2">
                      <ImageField
                        label={label}
                        src={slot?.url ?? ''}
                        alt={`${project.title} screenshot ${index + 1}`}
                        uploadAlt={alt || `${project.title || 'Project'} image ${index + 1}`}
                        onUploaded={uploadImage(index)}
                        onRemove={() => mutate((current) => withImage(current, index, { url: '' }))}
                      />
                      <Field
                        label="Image description"
                        value={alt}
                        onChange={(value) =>
                          mutate((current) => withImage(current, index, { alt: value }))
                        }
                        hint="Read aloud to people who cannot see the picture."
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              aria-label="Case-study story blocks"
              className="grid gap-3 pt-4 border-t border-border"
            >
              <div>
                <h3 className="m-0 text-base font-medium">Case-study story</h3>
                <p className="m-0 text-xs text-text-secondary">
                  Add rich blocks to turn this project into a deep case study. When empty, standard
                  project details are shown.
                </p>
              </div>
              <BlocksEditor
                blocks={project.story?.blocks ?? []}
                onChange={(blocks) => mutate((current) => ({ ...current, story: { blocks } }))}
                media={media}
              />
            </section>
          </>
        );
      }}
    />
  );
}
