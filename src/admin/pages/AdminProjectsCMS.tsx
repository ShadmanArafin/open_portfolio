import React, { useState } from 'react';
import { Selector, TextArea, TextInput } from '../components/AdminFields';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { yearOptions } from '../../cms/utils/dates';
import { firstSortOrder, makeId } from '../utils/listOps';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { useCMS } from '../../cms/context/CMSContext';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AdminImageField } from '../components/AdminImageField';
import { ProjectItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxCard, AstryxButton } from '../components/astryx/AstryxComponents';
import { Plus, Copy, Trash2, Save, Check } from 'lucide-react';

const PUBLISH_STATUSES = ['draft', 'published', 'archived'];
const YEARS = yearOptions();
/** Description paragraphs are stored as an array and edited as one blank-line-separated block. */
const PARAGRAPH_BREAK = '\n\n';

export const AdminProjectsCMS: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const [savedId, setSavedId] = useState<string | null>(null);

  const projects = [...draftData.projects].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddProject = () => {
    const newId = `proj-${Date.now()}`;
    const newProject: ProjectItem = {
      id: newId,
      slug: `new-project-${Date.now()}`,
      number: String(projects.length + 1).padStart(2, '0'),
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
      // Top of the list: the screen unshifts, and the list renders by sortOrder.
      sortOrder: firstSortOrder(projects),
      status: 'draft',
      visualPlaceholder: 'from-emerald-950 via-zinc-900 to-black',
      // Empty, not borrowed. These used to carry Apex's URL and screenshots,
      // so a new project published with another client's work attached.
      liveUrl: '',
      siteUrl: '',
      companyUrl: '',
      images: [
        { id: makeId('img'), label: '01 / OVERVIEW', alt: '', url: '' },
        { id: makeId('img'), label: '02 / EDITORIAL', alt: '', url: '' },
        { id: makeId('img'), label: '03 / INTERFACE', alt: '', url: '' },
        { id: makeId('img'), label: '04 / PORTAL', alt: '', url: '' },
      ],
      overview: ['Overview paragraph shown on the project detail page.'],
      challenge: 'What problem did this project set out to solve?',
      approachSteps: [{ title: 'Discovery', description: 'How the work started.' }],
      keyScreensCount: 0,
      outcomeNote: '',
    };

    updateDraft((draft) => {
      draft.projects.unshift(newProject);
    });
  };

  const handleDuplicateProject = (proj: ProjectItem) => {
    const dupId = `proj-${Date.now()}`;
    const dupProject: ProjectItem = {
      ...JSON.parse(JSON.stringify(proj)),
      id: dupId,
      slug: `${proj.slug}-copy`,
      title: `${proj.title} (Copy)`,
      name: `${proj.name} (Copy)`,
      status: 'draft',
      sortOrder: firstSortOrder(projects),
    };

    updateDraft((draft) => {
      draft.projects.unshift(dupProject);
    });
  };

  const handleDeleteProject = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    updateDraft((draft) => {
      draft.projects = draft.projects.filter((p) => p.id !== id);
    });
  };

  const handleProjectFieldChange = (id: string, field: keyof ProjectItem, value: any) => {
    updateDraft((draft) => {
      const p = draft.projects.find((item) => item.id === id);
      if (p) {
        (p as any)[field] = value;
      }
    });
  };

  /** The three URL fields are one thing to the person editing, so keep them in step. */
  const handleLiveUrlChange = (id: string, value: string) => {
    updateDraft((draft) => {
      const p = draft.projects.find((item) => item.id === id);
      if (p) {
        p.liveUrl = value;
        p.siteUrl = value;
        p.companyUrl = value;
      }
    });
  };

  const handleExplicitSave = (id: string) => {
    updateDraft((draft) => {
      draft.lastSavedAt = new Date().toISOString();
    });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleImageFileUpload = async (id: string, imgIndex: number, file: File) => {
    if (!file) return;

    const project = projects.find((p) => p.id === id);
    const media = await uploadMedia(file, {
      altText: `${project?.title || 'Project'} image ${imgIndex + 1}`,
    });
    if (!media) return;

    updateDraft((draft) => {
      const p = draft.projects.find((item) => item.id === id);
      if (p?.images?.[imgIndex]) {
        p.images[imgIndex].url = media.url;
      }
    });
  };

  const handleRemoveImage = (id: string, imgIndex: number) => {
    updateDraft((draft) => {
      const p = draft.projects.find((item) => item.id === id);
      if (p && p.images && p.images[imgIndex]) {
        p.images[imgIndex].url = '';
      }
    });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= projects.length) return;

    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    updateDraft((draft) => {
      reordered.forEach((proj, idx) => {
        const found = draft.projects.find((p) => p.id === proj.id);
        if (found) found.sortOrder = idx + 1;
      });
    });
  };

  return (
    <VStack gap={6}>
      {/* Astryx Header */}
      <AstryxHeader
        badgeText="Work"
        title="Selected work"
        subtitle="Your projects, the links they point at, and the images that go with them."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={handleAddProject}>
          Add Project
        </AstryxButton>
      </AstryxHeader>

      {projects.length === 0 ? (
        <AstryxCard variant="surface" className="text-center py-16">
          <span className="text-xs text-text-muted block mb-3">No projects yet</span>
          <AstryxButton variant="primary" icon={Plus} onClick={handleAddProject}>
            Create New Project
          </AstryxButton>
        </AstryxCard>
      ) : (
        <AdminRecordList>
          {projects.map((proj, index) => (
            <AdminRecord
              key={proj.id}
              value={proj.id}
              title={proj.title}
              badge={proj.status}
              badgeVariant={proj.status === 'published' ? 'green' : 'amber'}
              summary={`${proj.company} • ${proj.year}`}
              onMoveUp={() => moveProject(index, 'up')}
              onMoveDown={() => moveProject(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < projects.length - 1}
              onRemove={() => handleDeleteProject(proj.id)}
              removeLabel="Delete project"
            >
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
                <TextInput
                  label="Project title"
                  value={proj.title}
                  onChange={(_value, e) =>
                    handleProjectFieldChange(proj.id, 'title', e.target.value)
                  }
                  width="100%"
                />

                <TextInput
                  label="Client or company"
                  value={proj.company}
                  onChange={(_value, e) =>
                    handleProjectFieldChange(proj.id, 'company', e.target.value)
                  }
                  width="100%"
                />

                <TextInput
                  label="Live website URL (visit site link)"
                  value={proj.liveUrl || proj.siteUrl || proj.companyUrl || ''}
                  onChange={(_value, e) => handleLiveUrlChange(proj.id, e.target.value)}
                  description="When pasted, 'Visit Site' will open this URL in a new tab."
                  placeholder="https://example.com"
                  width="100%"
                />

                <TextInput
                  label="Role title"
                  value={proj.role}
                  onChange={(_value, e) =>
                    handleProjectFieldChange(proj.id, 'role', e.target.value)
                  }
                  width="100%"
                />

                <TextInput
                  label="Category / industry"
                  value={proj.category}
                  onChange={(_value, e) =>
                    handleProjectFieldChange(proj.id, 'category', e.target.value)
                  }
                  width="100%"
                />

                <Selector
                  label="Status"
                  value={proj.status}
                  options={PUBLISH_STATUSES}
                  onChange={(value) => handleProjectFieldChange(proj.id, 'status', value)}
                  width="100%"
                />

                <Selector
                  label="Year from"
                  value={proj.startYear ?? ''}
                  options={YEARS}
                  onChange={(value) => handleProjectFieldChange(proj.id, 'startYear', value)}
                  width="100%"
                />

                <Selector
                  label="Year to"
                  description="Leave empty for a single year."
                  value={proj.endYear ?? ''}
                  options={['', ...YEARS]}
                  onChange={(value) =>
                    handleProjectFieldChange(proj.id, 'endYear', value || undefined)
                  }
                  hasClear
                  isOptional
                  width="100%"
                />
              </Grid>

              <TextArea
                label="Project overview description"
                description="Blank line between paragraphs."
                value={proj.description?.join(PARAGRAPH_BREAK) || ''}
                onChange={(_value, e) =>
                  handleProjectFieldChange(
                    proj.id,
                    'description',
                    e.target.value.split(PARAGRAPH_BREAK)
                  )
                }
                rows={4}
                width="100%"
              />

              <Divider label="Screenshots & assets" />

              <Grid columns={{ minWidth: 200, repeat: 'fit' }} gap={4}>
                {[0, 1, 2, 3].map((imgIdx) => {
                  const imgObj = proj.images?.[imgIdx];
                  return (
                    <VStack key={imgIdx} gap={2} align="start">
                      <Text type="supporting" display="block">
                        {`0${imgIdx + 1} / Image asset`}
                      </Text>
                      <AdminImageField
                        src={imgObj?.url || ''}
                        alt={`${proj.title} screenshot ${imgIdx + 1}`}
                        size="thumb"
                        fit="cover"
                        buttonLabel={imgObj?.url ? 'Replace' : 'Upload'}
                        onFile={(file) => handleImageFileUpload(proj.id, imgIdx, file)}
                      />
                      {imgObj?.url && (
                        <Button
                          label="Remove image"
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 aria-hidden />}
                          onClick={() => handleRemoveImage(proj.id, imgIdx)}
                        />
                      )}
                    </VStack>
                  );
                })}
              </Grid>

              <HStack gap={2} justify="end">
                <AstryxButton
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleDuplicateProject(proj)}
                >
                  Duplicate
                </AstryxButton>
                <AstryxButton
                  variant="primary"
                  icon={savedId === proj.id ? Check : Save}
                  onClick={() => handleExplicitSave(proj.id)}
                >
                  {savedId === proj.id ? 'Saved' : 'Save project'}
                </AstryxButton>
              </HStack>
            </AdminRecord>
          ))}
        </AdminRecordList>
      )}
    </VStack>
  );
};
