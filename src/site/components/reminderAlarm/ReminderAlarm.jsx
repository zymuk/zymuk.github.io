import React, { useEffect, useRef, useState } from "react";
import {
  requestPermission,
  showNotification,
  scheduleReminder,
  cancelReminder,
} from "../../../utils/notifications";
import { rescheduleRepeat } from "../../../utils/recurrence";
import { playReminderSound } from "../../../utils/sound";
import "./ReminderAlarm.css";

const STORAGE_KEY = "reminders";

const loadReminders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Invalid reminders data in localStorage:", error);
    return [];
  }
};

function ReminderAlarm() {
  const [reminders, setReminders] = useState(loadReminders);
  const [alarmFiredIds, setAlarmFiredIds] = useState([]);
  const [, setTick] = useState(0);
  const remindersRef = useRef(reminders);

  const commit = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
    remindersRef.current = next;
    setReminders(next);
    window.dispatchEvent(new CustomEvent("zymuk-reminders-changed"));
  };

  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  useEffect(() => {
    const sync = (event) => {
      const next = loadReminders();
      remindersRef.current = next;
      setReminders(next);
      const existing = new Set(next.map((reminder) => reminder.id));
      setAlarmFiredIds((prev) => prev.filter((id) => existing.has(id)));
      const snoozedIds = event.detail && event.detail.snoozedIds;
      if (Array.isArray(snoozedIds)) {
        setAlarmFiredIds((prev) =>
          prev.filter((id) => !snoozedIds.includes(id)),
        );
      }
    };
    window.addEventListener("zymuk-reminders-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("zymuk-reminders-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const now = Date.now();
    const overdue = remindersRef.current.filter(
      (reminder) => reminder.dueAt <= now && !reminder.notified,
    );
    if (overdue.length === 0) {
      return;
    }
    const overdueOneshot = overdue.filter((reminder) => !reminder.repeat);
    setAlarmFiredIds((prev) => [
      ...new Set([...prev, ...overdueOneshot.map((reminder) => reminder.id)]),
    ]);
    const updated = remindersRef.current.map((reminder) =>
      reminder.dueAt <= now && !reminder.notified
        ? rescheduleRepeat(reminder, now)
        : reminder,
    );
    commit(updated);
    updated
      .filter((reminder) => reminder.repeat && !reminder.notified)
      .forEach((reminder) => scheduleReminder(reminder));
    if (overdueOneshot.length === 0) {
      return;
    }
    const notifyMissed = async () => {
      const permission = await requestPermission();
      if (permission !== "granted") {
        return;
      }
      const summaryTitle =
        overdueOneshot.length === 1
          ? overdueOneshot[0].title
          : `${overdueOneshot.length} reminders`;
      playReminderSound();
      await showNotification(
        summaryTitle,
        "This reminder was missed while the page was closed.",
      );
    };
    notifyMissed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const due = remindersRef.current.filter(
        (reminder) => !reminder.notified && reminder.dueAt <= now,
      );
      if (due.length > 0) {
        setAlarmFiredIds((prev) => [
          ...new Set([...prev, ...due.map((reminder) => reminder.id)]),
        ]);
        due.forEach((reminder) => {
          cancelReminder(reminder.id);
          playReminderSound();
          showNotification(reminder.title, "Reminder from Zymuk Page", {
            id: reminder.id,
          });
        });
        const updated = remindersRef.current.map((reminder) =>
          !reminder.notified && reminder.dueAt <= now
            ? rescheduleRepeat(reminder, now)
            : reminder,
        );
        commit(updated);
        updated
          .filter((reminder) => reminder.repeat && !reminder.notified)
          .forEach((reminder) => scheduleReminder(reminder));
      }
      setTick((t) => t + 1);
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (alarmFiredIds.length === 0) {
      return undefined;
    }
    playReminderSound();
    const id = setInterval(playReminderSound, 5000);
    return () => clearInterval(id);
  }, [alarmFiredIds.length]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return undefined;
    }
    const handleMessage = (event) => {
      const data = event.data;
      if (data && data.type === "REMINDER_SHOWN") {
        const next = remindersRef.current.map((reminder) =>
          reminder.id === data.id && !reminder.repeat
            ? { ...reminder, notified: true }
            : reminder,
        );
        commit(next);
      } else if (data && data.type === "REMINDER_SNOOZED") {
        const current = remindersRef.current.find((r) => r.id === data.id);
        if (current) {
          const dueAt = Date.now() + data.snoozeMinutes * 60000;
          const next = remindersRef.current.map((reminder) =>
            reminder.id === data.id
              ? { ...reminder, dueAt, notified: false }
              : reminder,
          );
          commit(next);
          setAlarmFiredIds((prev) => prev.filter((id) => id !== data.id));
          scheduleReminder({ ...current, dueAt });
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissReminder = (id) => {
    setAlarmFiredIds((prev) => prev.filter((alarmId) => alarmId !== id));
    const next = remindersRef.current.map((reminder) =>
      reminder.id === id && !reminder.repeat
        ? { ...reminder, notified: true }
        : reminder,
    );
    commit(next);
  };

  const dismissAlarm = () => {
    const fired = new Set(alarmFiredIds);
    setAlarmFiredIds([]);
    const next = remindersRef.current.map((reminder) =>
      fired.has(reminder.id) && !reminder.repeat
        ? { ...reminder, notified: true }
        : reminder,
    );
    commit(next);
  };

  const snoozeReminder = (id, minutes) => {
    const dueAt = Date.now() + minutes * 60000;
    setAlarmFiredIds((prev) => prev.filter((alarmId) => alarmId !== id));
    const current = remindersRef.current.find((r) => r.id === id);
    if (!current) {
      return;
    }
    const next = remindersRef.current.map((reminder) =>
      reminder.id === id ? { ...reminder, dueAt, notified: false } : reminder,
    );
    commit(next);
    cancelReminder(id);
    scheduleReminder({ ...current, dueAt });
  };

  const deleteReminder = (id) => {
    cancelReminder(id);
    setAlarmFiredIds((prev) => prev.filter((alarmId) => alarmId !== id));
    const next = remindersRef.current.filter((reminder) => reminder.id !== id);
    commit(next);
  };

  if (alarmFiredIds.length === 0) {
    return null;
  }

  return (
    <div
      className="reminder-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Reminder alarm"
    >
      <div className="reminder-modal">
        <h2 className="reminder-modal-title">Reminder is ringing</h2>
        <ul className="reminder-modal-list">
          {alarmFiredIds.map((id) => {
            const reminder = reminders.find((r) => r.id === id);
            if (!reminder) {
              return null;
            }
            return (
              <li key={id} className="reminder-modal-item">
                <div className="reminder-info">
                  <span className="reminder-title">{reminder.title}</span>
                  <span className="reminder-due">
                    Due {new Date(reminder.dueAt).toLocaleString()}
                  </span>
                </div>
                <div className="reminder-actions">
                  <button
                    className="btn-primary reminder-action"
                    onClick={() => dismissReminder(reminder.id)}
                  >
                    Dismiss
                  </button>
                  <button
                    className="btn-secondary reminder-action"
                    onClick={() => snoozeReminder(reminder.id, 5)}
                  >
                    Snooze 5m
                  </button>
                  <button
                    className="btn-secondary reminder-action"
                    onClick={() => snoozeReminder(reminder.id, 10)}
                  >
                    Snooze 10m
                  </button>
                  <button
                    className="btn-secondary reminder-delete reminder-action"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button className="btn-secondary" onClick={dismissAlarm}>
          Dismiss all
        </button>
      </div>
    </div>
  );
}

export default ReminderAlarm;
