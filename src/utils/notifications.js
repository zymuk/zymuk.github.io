const FALLBACK_TAG = "zymuk-reminder";

const isServiceWorkerAvailable = () =>
  "serviceWorker" in navigator && "Notification" in window;

const isNotificationSupported = () => "Notification" in window;

const requestPermission = async () => {
  if (!isNotificationSupported()) {
    return "unsupported";
  }
  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }
  return Notification.permission;
};

const showPageNotification = async (title, body, extraData = {}) => {
  if (!isNotificationSupported()) {
    return false;
  }
  try {
    const notification = new Notification(title, {
      body,
      tag: `${FALLBACK_TAG}-${extraData.id || Date.now()}`,
      data: { url: "/#/reminders", ...extraData },
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return false;
  }
};

const showNotification = async (title, body, extraData = {}) => {
  if (isServiceWorkerAvailable()) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, {
          body,
          tag: `reminder-${extraData.id || Date.now()}`,
          icon: `${process.env.PUBLIC_URL}/logo192.png`,
          data: { url: "/#/reminders", ...extraData },
          ...(extraData.id
            ? {
                requireInteraction: true,
                actions: [
                  { action: "snooze5", title: "Snooze 5 min" },
                  { action: "snooze10", title: "Snooze 10 min" },
                ],
              }
            : {}),
        });
        return true;
      }
    } catch (error) {
      console.error("Service worker notification failed:", error);
    }
  }
  return showPageNotification(title, body, extraData);
};

const postToController = (data) => {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
    return;
  }
  navigator.serviceWorker.controller.postMessage(data);
};

const scheduleReminder = (reminder) => {
  postToController({
    type: "SCHEDULE_REMINDER",
    id: reminder.id,
    title: reminder.title,
    body: "Reminder from Zymuk Page",
    dueAt: reminder.dueAt,
  });
};

const cancelReminder = (id) => {
  postToController({ type: "CANCEL_REMINDER", id });
};

export {
  requestPermission,
  showNotification,
  scheduleReminder,
  cancelReminder,
};
