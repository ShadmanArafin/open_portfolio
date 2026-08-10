'use client';

import React, { useState } from 'react';
import { Selector, TextArea, TextInput } from '../components/AdminFields';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Divider } from '@astryxdesign/core/Divider';
import { Button } from '@astryxdesign/core/Button';
import { firstSortOrder } from '../utils/listOps';
import { useCMS } from '../../cms/context/CMSContext';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AdminImageField } from '../components/AdminImageField';
import { CMSImage } from '../../components/common/CMSImage';
import { CaseStudyItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxCard, AstryxButton } from '../components/astryx/AstryxComponents';
import { Plus, Trash2, Check, Save, Copy } from 'lucide-react';

const PUBLISH_STATUSES = ['draft', 'published', 'archived'];

export const AdminCaseStudiesCMS: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const [savedId, setSavedId] = useState<string | null>(null);

  const caseStudies = [...draftData.caseStudies].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddCaseStudy = () => {
    const newId = `cs-${Date.now()}`;
    const newCS: CaseStudyItem = {
      id: newId,
      slug: `case-study-${Date.now()}`,
      number: `0${caseStudies.length + 1}`,
      title: 'New Case Study Title',
      category: '',
      year: String(new Date().getFullYear()),
      // Empty, not Apex's screenshot.
      coverImage: '',
      shortChallenge:
        'Exploring complex user problems and turning them into intuitive design systems.',
      disciplines: [],
      featured: true,
      role: '',
      timeline: '8 Weeks',
      platform: 'Web & Mobile App',
      industry: 'Enterprise SaaS',
      overview: [
        'Detailed case study overview paragraph 1.',
        'Detailed case study overview paragraph 2.',
      ],
      challenge: 'The primary challenge was streamlining complex workflows for high-volume users.',
      userResearch: {
        title: 'User Insights & Pain Points',
        summary: 'Conducted user interviews with core stakeholders to identify friction points.',
        keyInsights: [
          'Users struggled with multi-step navigation',
          'High drop-off on checkout flow',
        ],
      },
      userFlows: {
        title: 'Optimized Workflow Architecture',
        description: 'Simplified 7-step process down to 3 clear actions.',
        steps: ['Discovery', 'Configuration', 'Checkout'],
      },
      wireframes: [
        {
          id: `w-${Date.now()}`,
          title: 'Early exploration',
          description: 'What you were working out at this stage.',
          gradient: 'from-accent/20 to-surface-secondary',
          image: '',
        },
      ],
      keyDecisions: [
        {
          number: '01',
          title: 'Single-Page Checkout Flow',
          rationale: 'Reduced friction during high-intent purchasing.',
          impact: '+24% Conversion',
        },
        {
          number: '02',
          title: 'Contextual Side Drawer Navigation',
          rationale: 'Maintained screen context while exploring product details.',
          impact: '-30% Support Tickets',
        },
      ],
      finalSolution: {
        title: 'High-Fidelity Interface System',
        description: '',
        highlights: ['Accessible WCAG contrast compliance', 'Dark and light mode system tokens'],
      },
      designSystemTokens: {
        colors: [],
        typography: '',
        spacingScale: '',
      },
      outcome: {
        summary: '',
        metrics: [],
      },
      outcomes: [],
      blocks: [],
      sortOrder: firstSortOrder(caseStudies),
      status: 'draft',
    };

    updateDraft((draft) => {
      draft.caseStudies.unshift(newCS);
    });
  };

  const handleDuplicateCaseStudy = (cs: CaseStudyItem) => {
    const dupId = `cs-${Date.now()}`;
    const dupCS: CaseStudyItem = {
      ...JSON.parse(JSON.stringify(cs)),
      id: dupId,
      slug: `${cs.slug}-copy`,
      title: `${cs.title} (Copy)`,
      status: 'draft',
      sortOrder: firstSortOrder(caseStudies),
    };

    updateDraft((draft) => {
      draft.caseStudies.unshift(dupCS);
    });
  };

  const handleDeleteCaseStudy = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this case study?')) return;
    updateDraft((draft) => {
      draft.caseStudies = draft.caseStudies.filter((cs) => cs.id !== id);
    });
  };

  const handleCSFieldChange = (csId: string, field: keyof CaseStudyItem, value: any) => {
    updateDraft((draft) => {
      const cs = draft.caseStudies.find((item) => item.id === csId);
      if (cs) {
        (cs as any)[field] = value;
      }
    });
  };

  const moveCaseStudy = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= caseStudies.length) return;

    const reordered = [...caseStudies];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    updateDraft((draft) => {
      reordered.forEach((cs, idx) => {
        const found = draft.caseStudies.find((c) => c.id === cs.id);
        if (found) found.sortOrder = idx + 1;
      });
    });
  };

  const handleExplicitSave = (csId: string) => {
    updateDraft((draft) => {
      draft.lastSavedAt = new Date().toISOString();
    });
    setSavedId(csId);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleAddKeyDecision = (csId: string) => {
    updateDraft((draft) => {
      const cs = draft.caseStudies.find((item) => item.id === csId);
      if (cs) {
        if (!cs.keyDecisions) cs.keyDecisions = [];
        const nextNum = `0${cs.keyDecisions.length + 1}`;
        cs.keyDecisions.push({
          number: nextNum,
          title: 'New Design Decision',
          rationale: 'Why this decision was made.',
          impact: 'Measurable user impact.',
        });
      }
    });
  };

  const handleRemoveKeyDecision = (csId: string, idx: number) => {
    updateDraft((draft) => {
      const cs = draft.caseStudies.find((item) => item.id === csId);
      if (cs && cs.keyDecisions) {
        cs.keyDecisions.splice(idx, 1);
      }
    });
  };

  const handleKeyDecisionChange = (csId: string, idx: number, field: string, value: any) => {
    updateDraft((draft) => {
      const cs = draft.caseStudies.find((item) => item.id === csId);
      if (cs && cs.keyDecisions && cs.keyDecisions[idx]) {
        (cs.keyDecisions[idx] as any)[field] = value;
      }
    });
  };

  const handleCoverUpload = async (csId: string, file: File) => {
    if (!file) return;
    const target = caseStudies.find((cs) => cs.id === csId);
    const media = await uploadMedia(file, {
      altText: `${target?.title ?? 'Case study'} cover image`,
    });
    if (media) handleCSFieldChange(csId, 'coverImage', media.url);
  };

  return (
    <VStack gap={6}>
      {/* Astryx Header */}
      <AstryxHeader
        badgeText="Case studies"
        title="Case Studies & Design Stories"
        subtitle="Longer stories about your work — the research, the decisions you made, and what came of them."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={handleAddCaseStudy}>
          Add Case Study
        </AstryxButton>
      </AstryxHeader>

      {caseStudies.length === 0 ? (
        <AstryxCard variant="surface" className="text-center py-16">
          <span className="text-xs text-text-muted block mb-3">No case studies yet</span>
          <AstryxButton variant="primary" icon={Plus} onClick={handleAddCaseStudy}>
            Create New Case Study
          </AstryxButton>
        </AstryxCard>
      ) : (
        <AdminRecordList>
          {caseStudies.map((cs, index) => (
            <AdminRecord
              key={cs.id}
              value={cs.id}
              title={cs.title}
              badge={cs.status}
              badgeVariant={cs.status === 'published' ? 'green' : 'amber'}
              summary={`${cs.category} \u2022 ${cs.year}`}
              media={
                cs.coverImage ? (
                  <CMSImage src={cs.coverImage} alt="" className="w-full h-full object-cover" />
                ) : undefined
              }
              onMoveUp={() => moveCaseStudy(index, 'up')}
              onMoveDown={() => moveCaseStudy(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < caseStudies.length - 1}
              onRemove={() => handleDeleteCaseStudy(cs.id)}
              removeLabel="Delete case study"
            >
              <HStack gap={4} align="start" wrap="wrap">
                <AdminImageField
                  src={cs.coverImage || ''}
                  alt={`${cs.title} cover`}
                  size="thumb"
                  fit="cover"
                  buttonLabel={cs.coverImage ? 'Replace cover' : 'Upload cover'}
                  onFile={(file) => handleCoverUpload(cs.id, file)}
                />

                <VStack gap={4}>
                  <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
                    <TextInput
                      label="Case study title"
                      value={cs.title}
                      onChange={(_value, e) => handleCSFieldChange(cs.id, 'title', e.target.value)}
                      width="100%"
                    />

                    <TextInput
                      label="Category / architecture"
                      value={cs.category}
                      onChange={(_value, e) =>
                        handleCSFieldChange(cs.id, 'category', e.target.value)
                      }
                      width="100%"
                    />

                    <TextInput
                      label="Role title"
                      value={cs.role}
                      onChange={(_value, e) => handleCSFieldChange(cs.id, 'role', e.target.value)}
                      width="100%"
                    />

                    <TextInput
                      label="Timeline / duration"
                      value={cs.timeline}
                      onChange={(_value, e) =>
                        handleCSFieldChange(cs.id, 'timeline', e.target.value)
                      }
                      width="100%"
                    />

                    <Selector
                      label="Status"
                      value={cs.status}
                      options={PUBLISH_STATUSES}
                      onChange={(value) => handleCSFieldChange(cs.id, 'status', value)}
                      width="100%"
                    />
                  </Grid>
                </VStack>
              </HStack>

              <TextArea
                label="Short challenge summary"
                value={cs.shortChallenge}
                onChange={(_value, e) =>
                  handleCSFieldChange(cs.id, 'shortChallenge', e.target.value)
                }
                rows={3}
                width="100%"
              />

              <Divider label="Key design decisions" />

              <HStack justify="end">
                <AstryxButton
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={() => handleAddKeyDecision(cs.id)}
                >
                  Add Decision
                </AstryxButton>
              </HStack>

              <VStack gap={3}>
                {cs.keyDecisions?.map((kd, kdIdx) => (
                  <AstryxCard key={kdIdx} variant="surface" density="compact">
                    <VStack gap={3}>
                      <Grid columns={{ minWidth: 200, repeat: 'fit' }} gap={3}>
                        <TextInput
                          label="Number"
                          value={kd.number}
                          onChange={(_value, e) =>
                            handleKeyDecisionChange(cs.id, kdIdx, 'number', e.target.value)
                          }
                          width="100%"
                        />
                        <TextInput
                          label="Decision title"
                          value={kd.title}
                          onChange={(_value, e) =>
                            handleKeyDecisionChange(cs.id, kdIdx, 'title', e.target.value)
                          }
                          width="100%"
                        />
                        <TextInput
                          label="Impact"
                          placeholder="e.g. +24% conversion"
                          value={kd.impact}
                          onChange={(_value, e) =>
                            handleKeyDecisionChange(cs.id, kdIdx, 'impact', e.target.value)
                          }
                          width="100%"
                        />
                      </Grid>

                      <TextArea
                        label="Rationale"
                        value={kd.rationale}
                        onChange={(_value, e) =>
                          handleKeyDecisionChange(cs.id, kdIdx, 'rationale', e.target.value)
                        }
                        rows={2}
                        width="100%"
                      />

                      <HStack justify="end">
                        <Button
                          label="Remove decision"
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 aria-hidden />}
                          onClick={() => handleRemoveKeyDecision(cs.id, kdIdx)}
                        />
                      </HStack>
                    </VStack>
                  </AstryxCard>
                ))}
              </VStack>

              <HStack gap={2} justify="end">
                <AstryxButton
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleDuplicateCaseStudy(cs)}
                >
                  Duplicate
                </AstryxButton>
                <AstryxButton
                  variant="primary"
                  icon={savedId === cs.id ? Check : Save}
                  onClick={() => handleExplicitSave(cs.id)}
                >
                  {savedId === cs.id ? 'Saved' : 'Save case study'}
                </AstryxButton>
              </HStack>
            </AdminRecord>
          ))}
        </AdminRecordList>
      )}
    </VStack>
  );
};
