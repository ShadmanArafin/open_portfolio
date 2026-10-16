'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';

export interface MessageActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Inbox mutations, as server actions. Each one guards itself — the group
 * layout is user experience, not the boundary.
 */
export async function markMessageAction(
  id: string,
  status: 'read' | 'unread'
): Promise<MessageActionResult> {
  await requireOwner();
  if (!id) return { ok: false, error: 'A message is required.' };
  await (await getStorageAdapter()).messages.update(id, { status });
  revalidatePath('/admin/messages');
  return { ok: true };
}

export async function deleteMessageAction(id: string): Promise<MessageActionResult> {
  await requireOwner();
  if (!id) return { ok: false, error: 'A message is required.' };
  await (await getStorageAdapter()).messages.remove(id);
  revalidatePath('/admin/messages');
  return { ok: true };
}
