import React from 'react';
import { TextInput } from '../components/AdminFields';
import { VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Plus, AlertTriangle } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { NavLinkItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxButton } from '../components/astryx/AstryxComponents';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { sorted, moveById, nextSortOrder, makeId } from '../utils/listOps';

/** Routes the site actually serves. Anything else 404s back to the homepage. */
const KNOWN_ROUTES = ['/', '/work', '/case-studies', '/about', '/contact'];

function isKnownRoute(path: string): boolean {
  if (!path.startsWith('/')) return true; // external or anchor link — not our problem
  return KNOWN_ROUTES.includes(path.replace(/\/$/, '') || '/');
}

export const AdminNavigationCMS: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const links = sorted(draftData.navLinks ?? []);

  const patch = (id: string, field: keyof NavLinkItem, value: unknown) => {
    updateDraft((draft) => {
      const link = draft.navLinks.find((l) => l.id === id);
      if (link) (link as any)[field] = value;
    });
  };

  const addLink = () => {
    updateDraft((draft) => {
      draft.navLinks.push({
        id: makeId('nav'),
        label: 'New link',
        path: '/',
        visible: true,
        sortOrder: nextSortOrder(draft.navLinks),
      });
    });
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Navigation"
        title={`Header Navigation (${links.length})`}
        subtitle="Links in the top navigation bar, in order. The logo always links to the homepage."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={addLink}>
          Add Link
        </AstryxButton>
      </AstryxHeader>

      <AdminRecordList>
        {links.map((link, idx) => {
          const unknown = !isKnownRoute(link.path);

          return (
            <AdminRecord
              key={link.id}
              value={link.id}
              title={link.label || 'Untitled link'}
              visible={link.visible}
              onToggleVisible={() => patch(link.id, 'visible', !link.visible)}
              canMoveUp={idx > 0}
              canMoveDown={idx < links.length - 1}
              onMoveUp={() =>
                updateDraft((draft) => {
                  draft.navLinks = moveById(draft.navLinks, link.id, 'up');
                })
              }
              onMoveDown={() =>
                updateDraft((draft) => {
                  draft.navLinks = moveById(draft.navLinks, link.id, 'down');
                })
              }
              onRemove={() =>
                updateDraft((draft) => {
                  draft.navLinks = draft.navLinks.filter((l) => l.id !== link.id);
                })
              }
              removeLabel="Remove link"
              summary={link.path}
            >
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
                <TextInput
                  label="Label"
                  value={link.label}
                  onChange={(_value, e) => patch(link.id, 'label', e.target.value)}
                  width="100%"
                />

                <TextInput
                  label="Path"
                  value={link.path}
                  onChange={(_value, e) => patch(link.id, 'path', e.target.value)}
                  width="100%"
                />
              </Grid>

              {unknown && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[var(--color-background-yellow)] border border-[var(--color-border-yellow)]">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-text-yellow)] flex-shrink-0 mt-0.5" />
                  <p className="text-[length:var(--font-size-sm)] text-[var(--color-text-yellow)] leading-relaxed">
                    This site has no <span className="">{link.path}</span> page — visitors who click
                    it get sent back to the homepage. Known pages:{' '}
                    <span className="">{KNOWN_ROUTES.join('  ')}</span>
                  </p>
                </div>
              )}
            </AdminRecord>
          );
        })}
      </AdminRecordList>
    </VStack>
  );
};
