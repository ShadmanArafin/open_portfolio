import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandPalette } from '@astryxdesign/core/CommandPalette';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import { useCMS } from '../../../cms/context/CMSContext';

interface AstryxCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Jump-to-screen palette, built on the design system's CommandPalette.
 *
 * Destinations mirror the side nav. `auxiliaryData.group` is what drives the
 * palette's own grouping, so entries only need a group name — no grouping
 * logic here.
 */
export const AstryxCommandPalette: React.FC<AstryxCommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { draftData } = useCMS();

  const source = useMemo(() => {
    const unread = draftData.messages.filter((m) => m.status === 'unread').length;

    const destinations = [
      { id: '/admin', label: 'Dashboard', group: 'Overview' },
      { id: '/admin/pages', label: 'Homepage builder', group: 'Overview' },

      { id: '/admin/projects', label: 'Selected work', group: 'Content' },
      { id: '/admin/case-studies', label: 'Case studies', group: 'Content' },
      { id: '/admin/brands', label: 'Brands', group: 'Content' },
      { id: '/admin/experience', label: 'Experience', group: 'Content' },
      { id: '/admin/education', label: 'Education', group: 'Content' },
      { id: '/admin/process', label: 'Process steps', group: 'Content' },
      { id: '/admin/capabilities', label: 'Capabilities', group: 'Content' },
      { id: '/admin/recommendations', label: 'Recommendations', group: 'Content' },

      { id: '/admin/media', label: 'Media library', group: 'Assets & inbox' },
      { id: '/admin/artifacts', label: 'Visual explorations', group: 'Assets & inbox' },
      {
        id: '/admin/messages',
        label: unread > 0 ? `Messages (${unread} unread)` : 'Messages',
        group: 'Assets & inbox',
      },

      { id: '/admin/navigation', label: 'Navigation', group: 'Configuration' },
      { id: '/admin/footer', label: 'Footer & social', group: 'Configuration' },
      { id: '/admin/microcopy', label: 'Microcopy', group: 'Configuration' },
      { id: '/admin/appearance', label: 'Appearance', group: 'Configuration' },
      { id: '/admin/seo', label: 'SEO', group: 'Configuration' },
      { id: '/admin/settings', label: 'Settings & backup', group: 'Configuration' },
      { id: '/admin/history', label: 'Version history', group: 'Configuration' },
    ].map((item) => ({
      id: item.id,
      label: item.label,
      auxiliaryData: { group: item.group },
    }));

    return createStaticSource(destinations);
  }, [draftData.messages]);

  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      searchSource={source}
      label="Jump to a screen"
      onValueChange={(value) => {
        navigate(value);
        onClose();
      }}
      emptyBootstrapText="Type to search screens"
      emptySearchText="No screen matches that"
    />
  );
};
