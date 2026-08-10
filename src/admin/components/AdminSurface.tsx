import React from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { AdminFontProvider, useAdminFont } from '../context/AdminFontContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * Root wrapper for every admin surface.
 *
 * Mounts the real Astryx `Theme` with the built neutral theme, so the panel
 * gets the system's own light and dark palettes rather than an approximation.
 * `Theme` stamps `data-astryx-theme` on its wrapper, which is what scopes the
 * theme CSS to this subtree.
 *
 * `mode` follows the site's existing theme toggle so the two stay in step.
 *
 * The draft preview renders in an iframe — a separate document — so neither
 * the theme nor the editor typeface reaches it. It keeps showing the site's
 * own look, which is the whole point of a preview.
 */
const Surface: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => {
  const { font } = useAdminFont();
  const { theme } = useTheme();

  return (
    <Theme theme={neutralTheme} mode={theme === 'light' ? 'light' : 'dark'}>
      <div className={`admin-ui ${className}`} data-admin-font={font}>
        {children}
      </div>
    </Theme>
  );
};

export const AdminSurface: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <AdminFontProvider>
    <Surface className={className}>{children}</Surface>
  </AdminFontProvider>
);
