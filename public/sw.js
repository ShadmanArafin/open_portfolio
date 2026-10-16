/* The owner's buzz. Kept deliberately small and dependency-free.
 *
 * Payload-less pushes ("tickles"): the server wakes us, and we ask the inbox
 * how many unread enquiries there are — with the owner's own session cookie,
 * so a signed-out browser learns nothing. Nothing sensitive crosses the push
 * service; there is no payload to decrypt.
 *
 * Version the cache name when this file changes; old workers die on update.
 */
const WORKER_VERSION = 'opb-push-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function unreadCount() {
  try {
    const res = await fetch('/api/admin/messages', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.ok !== true || !Array.isArray(data.messages)) return null;
    return data.messages.filter((m) => m.status === 'unread').length;
  } catch {
    return null;
  }
}

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      const unread = await unreadCount();
      const title = 'New enquiry';
      const body =
        typeof unread === 'number' && unread > 0
          ? unread === 1
            ? 'One unread enquiry is waiting in your inbox.'
            : `${unread} unread enquiries are waiting in your inbox.`
          : 'Something new is waiting in your inbox.';
      await self.registration.showNotification(title, {
        body,
        data: { url: '/admin/messages' },
      });
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/admin/messages';
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).pathname.startsWith('/admin')) {
          await client.focus();
          await client.navigate(url);
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});

void WORKER_VERSION;
