'use client';

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
      { id: '/', label: 'Dashboard', group: 'Overview' },
      { id: '/pages', label: 'Pages', group: 'Overview' },

      { id: '/projects', label: 'Selected work', group: 'Content' },
      { id: '/case-studies', label: 'Case studies', group: 'Content' },
      { id: '/brands', label: 'Brands', group: 'Content' },
      { id: '/experience', label: 'Experience', group: 'Content' },
      { id: '/education', label: 'Education', group: 'Content' },
      { id: '/process', label: 'Process steps', group: 'Content' },
      { id: '/capabilities', label: 'Capabilities', group: 'Content' },
      { id: '/recommendations', label: 'Recommendations', group: 'Content' },

      { id: '/media', label: 'Media library', group: 'Assets & inbox' },
      { id: '/artifacts', label: 'Visual explorations', group: 'Assets & inbox' },
      {
        id: '/messages',
        label: unread > 0 ? `Messages (${unread} unread)` : 'Messages',
        group: 'Assets & inbox',
      },

      { id: '/navigation', label: 'Navigation', group: 'Configuration' },
      { id: '/footer', label: 'Footer & social', group: 'Configuration' },
      { id: '/microcopy', label: 'Microcopy', group: 'Configuration' },
      { id: '/appearance', label: 'Appearance', group: 'Configuration' },
      { id: '/seo', label: 'SEO', group: 'Configuration' },
      { id: '/settings', label: 'Settings & backup', group: 'Configuration' },
      { id: '/history', label: 'Version history', group: 'Configuration' },
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
