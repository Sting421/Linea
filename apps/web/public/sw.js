/* Text is supplied at delivery time; no call history or quotations are cached. */
self.addEventListener('push', event => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(payload.title || 'Linea update', {body:payload.body || 'Open Linea to review your check-in.',icon:'/linea-mark.svg',tag:payload.event_id, data:{url:payload.url || '/'}}));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin);
  if(target.origin!==self.location.origin)return;
  event.waitUntil(self.clients.openWindow(target.href));
});
