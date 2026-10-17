import { redirect } from 'next/navigation';

/**
 * The legacy deep link. `/admin/resume` was the same media library screen
 * under a second address; the library lives at `/admin/media` now, so the old
 * address forwards there rather than showing the legacy shell.
 */
export default function ResumeAliasPage() {
  redirect('/admin/media');
}
