const CACHE_NAME = "zymuk-page-v1";
const APP_SHELL_URLS = ["/", "/index.html", "/manifest.json"];
const scheduledReminders = new Map();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(APP_SHELL_URLS.map((url) => cache.add(url))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    }),
  );
});

function showReminderNotification(title, body, id) {
  self.registration.showNotification(title, {
    body,
    tag: `reminder-${id}`,
    icon: "logo192.png",
    requireInteraction: true,
    data: { id, url: "/#/reminders" },
    actions: [
      { action: "snooze5", title: "Snooze 5 min" },
      { action: "snooze10", title: "Snooze 10 min" },
    ],
  });
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) =>
        client.postMessage({ type: "REMINDER_SHOWN", id }),
      );
    });
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data) {
    return;
  }
  if (data.type === "SCHEDULE_REMINDER") {
    const delay = data.dueAt - Date.now();
    if (delay <= 0) {
      return;
    }
    const timeoutId = setTimeout(() => {
      scheduledReminders.delete(data.id);
      showReminderNotification(data.title, data.body, data.id);
    }, delay);
    scheduledReminders.set(data.id, timeoutId);
  } else if (data.type === "CANCEL_REMINDER") {
    const timeoutId = scheduledReminders.get(data.id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      scheduledReminders.delete(data.id);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const data = notification.data || {};
  const url = data.url || "/";
  notification.close();

  const snoozeMinutes =
    event.action === "snooze5" ? 5 : event.action === "snooze10" ? 10 : 0;

  if (snoozeMinutes > 0) {
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          if (windowClients.length === 0) {
            const delay = snoozeMinutes * 60 * 1000;
            const timeoutId = setTimeout(() => {
              showReminderNotification(data.title, data.body, data.id);
            }, delay);
            scheduledReminders.set(`snooze-${data.id}`, timeoutId);
          }
          windowClients.forEach((client) =>
            client.postMessage({
              type: "REMINDER_SNOOZED",
              id: data.id,
              snoozeMinutes,
            }),
          );
        }),
    );
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      }),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Zymuk Page", body: "" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: "Zymuk Page", body: event.data.text() };
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Zymuk Page", {
      body: data.body || "",
      tag: `push-${Date.now()}`,
      icon: "logo192.png",
      data: { url: data.url || "/#/reminders" },
    }),
  );
});
