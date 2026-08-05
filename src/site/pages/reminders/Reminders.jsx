import React, { useEffect, useRef, useState } from "react";
import usePageMeta from "../../../utils/usePageMeta";
import {
  requestPermission,
  showNotification,
  scheduleReminder,
  cancelReminder,
} from "../../../utils/notifications";
import "./Reminders.css";

const STORAGE_KEY = "reminders";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PRESET_COUNTDOWNS = [
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
  { label: "3 hours", seconds: 10800 },
];

const PRESET_ABSOLUTES = [
  { label: "In 1 hour", minutes: 60 },
  { label: "In 3 hours", minutes: 180 },
  { label: "Tomorrow 9 AM", days: 1, hour: 9 },
  { label: "Next Monday 9 AM", weekday: 1, hour: 9 },
];

const loadReminders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Invalid reminders data in localStorage:", error);
    return [];
  }
};

const generateId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const formatRepeatDays = (days) =>
  WEEKDAY_LABELS.filter((_, index) => days.includes(index)).join(", ");

const toLocalDatetime = (ts) => {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const readFileAsText = (file) => {
  if (typeof file.text === "function") {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

function Reminders() {
  usePageMeta({
    title: "Task Reminder",
    description:
      "Schedule tasks with a countdown or a specific time and get an OS notification.",
  });

  const [reminders, setReminders] = useState(loadReminders);
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("countdown");
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [repeatDays, setRepeatDays] = useState([]);
  const [status, setStatus] = useState("");
  const remindersRef = useRef(reminders);
  const fileInputRef = useRef(null);

  useEffect(() => {
    remindersRef.current = reminders;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
    window.dispatchEvent(new CustomEvent("zymuk-reminders-changed"));
  }, [reminders]);

  useEffect(() => {
    const syncFromStorage = () => {
      setReminders((prev) => {
        const next = loadReminders();
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    };
    window.addEventListener("zymuk-reminders-changed", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("zymuk-reminders-changed", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const formatTime = (total) => {
    const pad = (n) => String(n).padStart(2, "0");
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const formatRemaining = (dueAt) => {
    const total = Math.ceil((dueAt - Date.now()) / 1000);
    return total > 0 ? formatTime(total) : "";
  };

  const toggleRepeatDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const applyCountdownPreset = (seconds) => {
    setHours(Math.floor(seconds / 3600));
    setMinutes(Math.floor((seconds % 3600) / 60));
    setSeconds(seconds % 60);
    setStatus("");
  };

  const applyAbsolutePreset = (preset) => {
    const now = new Date();
    const target = new Date(now.getTime());
    if (preset.minutes) {
      target.setTime(target.getTime() + preset.minutes * 60000);
    } else if (preset.weekday !== undefined) {
      let diff = preset.weekday - now.getDay();
      if (diff <= 0) {
        diff += 7;
      }
      target.setDate(now.getDate() + diff);
      target.setHours(preset.hour, 0, 0, 0);
    } else if (preset.days) {
      target.setDate(now.getDate() + preset.days);
      target.setHours(preset.hour, 0, 0, 0);
    }
    setDatetime(toLocalDatetime(target.getTime()));
    setStatus("");
  };

  const resetForm = () => {
    setTitle("");
    setDatetime("");
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setRepeat(false);
    setRepeatDays([]);
    setEditingId(null);
  };

  const startEdit = (reminder) => {
    setEditingId(reminder.id);
    setType(reminder.kind || "countdown");
    setTitle(reminder.title);
    setRepeat(Boolean(reminder.repeat));
    setRepeatDays(reminder.repeatDays ? [...reminder.repeatDays] : []);
    setStatus("");
    if ((reminder.kind || "countdown") === "absolute") {
      setDatetime(toLocalDatetime(reminder.dueAt));
    } else {
      const durationMs =
        reminder.durationMs || reminder.dueAt - reminder.createdAt;
      const total = Math.max(1, Math.round(durationMs / 1000));
      setHours(Math.floor(total / 3600));
      setMinutes(Math.floor((total % 3600) / 60));
      setSeconds(total % 60);
    }
  };

  const submitReminder = async () => {
    const trimmed = title.trim();
    if (type === "absolute" && repeat && repeatDays.length === 0) {
      setStatus("Error: Please select at least one repeat day.");
      return;
    }
    let dueAt;
    let intervalMs = null;
    let countdownTotal = 0;
    if (type === "absolute") {
      const parsed = new Date(datetime).getTime();
      if (!datetime || Number.isNaN(parsed)) {
        setStatus("Error: Please choose a valid date and time.");
        return;
      }
      if (parsed <= Date.now()) {
        setStatus("Error: Reminder time must be in the future.");
        return;
      }
      dueAt = parsed;
    } else {
      countdownTotal =
        (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
      if (countdownTotal <= 0) {
        setStatus("Error: Please set a countdown duration greater than 0.");
        return;
      }
      dueAt = Date.now() + countdownTotal * 1000;
      intervalMs = countdownTotal * 1000;
    }
    const permission = await requestPermission();
    let statusMsg = "";
    if (permission === "denied") {
      statusMsg =
        "Warning: OS notifications are disabled. The reminder was still added.";
    } else if (permission === "unsupported") {
      statusMsg =
        "Warning: OS notifications are not supported in this browser. The reminder was still added.";
    }
    const isEditing = editingId !== null;
    const existing = isEditing
      ? remindersRef.current.find((r) => r.id === editingId)
      : null;
    const reminder = {
      id: isEditing ? editingId : generateId(),
      createdAt: existing ? existing.createdAt : Date.now(),
      kind: type,
      title: trimmed || "Reminder",
      dueAt,
      notified: false,
      repeat,
      ...(type === "countdown" ? { durationMs: countdownTotal * 1000 } : {}),
      ...(repeat && intervalMs !== null ? { intervalMs } : {}),
      ...(repeat && type === "absolute" ? { repeatDays } : {}),
    };
    if (isEditing) {
      cancelReminder(editingId);
      setReminders((prev) =>
        prev.map((r) => (r.id === editingId ? reminder : r)),
      );
    } else {
      setReminders((prev) => [...prev, reminder]);
    }
    if (!statusMsg) {
      statusMsg = isEditing ? "Reminder updated." : "Reminder added.";
    }
    setStatus(statusMsg);
    scheduleReminder(reminder);
    resetForm();
  };

  const deleteReminder = (id) => {
    cancelReminder(id);
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const clearAll = () => {
    reminders.forEach((reminder) => cancelReminder(reminder.id));
    setReminders([]);
    setStatus("All reminders cleared.");
  };

  const snoozeReminder = (id, minutes) => {
    const dueAt = Date.now() + minutes * 60000;
    const next = remindersRef.current.map((r) =>
      r.id === id ? { ...r, dueAt, notified: false } : r,
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
    setReminders(next);
    cancelReminder(id);
    const current = remindersRef.current.find((r) => r.id === id);
    if (current) {
      scheduleReminder({ ...current, dueAt });
    }
    window.dispatchEvent(
      new CustomEvent("zymuk-reminders-changed", {
        detail: { snoozedIds: [id] },
      }),
    );
    setStatus(`Reminder snoozed for ${minutes} minutes.`);
  };

  const canSnooze = (reminder) =>
    !reminder.repeat && reminder.dueAt <= Date.now();

  const exportReminders = () => {
    if (reminders.length === 0) {
      setStatus("Nothing to export yet.");
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(reminders, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "zymuk-reminders-backup.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus(`Exported ${reminders.length} reminder(s).`);
    } catch (error) {
      console.error("Failed to export reminders:", error);
      setStatus("Error: Failed to export reminders.");
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const text = await readFileAsText(file);
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setStatus("Error: The backup file must contain a list of reminders.");
        return;
      }
      const valid = parsed.filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          item.title.trim() &&
          typeof item.dueAt === "number",
      );
      if (valid.length === 0) {
        setStatus("Error: No valid reminders found in the backup file.");
        return;
      }
      const next = [...reminders];
      valid.forEach((item) => {
        const reminder = { ...item, title: item.title.trim() };
        const index = next.findIndex((r) => r.id === reminder.id);
        if (index >= 0) {
          next[index] = reminder;
        } else {
          next.push(reminder);
        }
      });
      reminders.forEach((r) => cancelReminder(r.id));
      setReminders(next);
      next.forEach((r) => scheduleReminder(r));
      setStatus(`Imported ${valid.length} reminder(s).`);
    } catch (error) {
      console.error("Failed to import reminders:", error);
      setStatus("Error: Could not read the backup file.");
    }
  };

  const handleTestNotification = async () => {
    const permission = await requestPermission();
    if (permission === "granted") {
      await showNotification("Test Notification", "Zymuk Page reminder test.");
      setStatus("Test notification sent. Check your OS notification center.");
    } else if (permission === "unsupported") {
      setStatus("Error: OS notifications are not supported in this browser.");
    } else {
      setStatus(
        "Error: Notification permission denied. Enable it in your browser settings.",
      );
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => a.dueAt - b.dueAt);

  return (
    <div className="reminders-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">Task Reminder</h1>
          <p className="page-subtitle">
            Schedule tasks and get an OS notification when it is time.
          </p>
        </div>
        <div className="glass-content">
          <div className="reminders-container">
            <div className="reminders-form">
              <div className="reminder-type">
                <label className="reminder-type-option">
                  <input
                    type="radio"
                    name="reminder-type"
                    value="countdown"
                    checked={type === "countdown"}
                    onChange={() => setType("countdown")}
                  />
                  Countdown
                </label>
                <label className="reminder-type-option">
                  <input
                    type="radio"
                    name="reminder-type"
                    value="absolute"
                    checked={type === "absolute"}
                    onChange={() => setType("absolute")}
                  />
                  Specific time
                </label>
              </div>
              <div className="reminder-title-field">
                <label htmlFor="reminder-title">Title (optional)</label>
                <input
                  id="reminder-title"
                  className="form-input"
                  type="text"
                  value={title}
                  placeholder="Optional, e.g. Call the client"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              {type === "countdown" ? (
                <>
                  <div className="reminder-inputs">
                    <div className="reminder-field">
                      <label htmlFor="reminder-hours">Hours</label>
                      <input
                        id="reminder-hours"
                        className="form-input reminder-number-input"
                        type="number"
                        min="0"
                        max="23"
                        value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                    />
                  </div>
                  <div className="reminder-field">
                    <label htmlFor="reminder-minutes">Minutes</label>
                    <input
                      id="reminder-minutes"
                      className="form-input reminder-number-input"
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                    />
                  </div>
                  <div className="reminder-field">
                    <label htmlFor="reminder-seconds">Seconds</label>
                    <input
                      id="reminder-seconds"
                      className="form-input reminder-number-input"
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(Number(e.target.value))}
                    />
                  </div>
                </div>
                  <div className="reminder-presets">
                    {PRESET_COUNTDOWNS.map((preset) => (
                      <button
                        key={preset.label}
                        className="btn-secondary reminder-preset"
                        onClick={() => applyCountdownPreset(preset.seconds)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="reminder-field">
                    <label htmlFor="reminder-datetime">Remind at</label>
                    <input
                      id="reminder-datetime"
                      className="form-input"
                      type="datetime-local"
                      value={datetime}
                      onChange={(e) => setDatetime(e.target.value)}
                    />
                  </div>
                  <div className="reminder-presets">
                    {PRESET_ABSOLUTES.map((preset) => (
                      <button
                        key={preset.label}
                        className="btn-secondary reminder-preset"
                        onClick={() => applyAbsolutePreset(preset)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="reminder-repeat-field">
                <label className="reminder-type-option">
                  <input
                    type="checkbox"
                    checked={repeat}
                    onChange={(e) => setRepeat(e.target.checked)}
                  />
                  Repeat
                </label>
                {type === "absolute" && repeat && (
                  <div className="reminder-repeat-days">
                    {WEEKDAY_LABELS.map((label, index) => (
                      <label key={label} className="reminder-day-option">
                        <input
                          type="checkbox"
                          checked={repeatDays.includes(index)}
                          onChange={() => toggleRepeatDay(index)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}
                {type === "countdown" && repeat && (
                  <p className="reminder-hint">
                    Will repeat every{" "}
                    {formatTime(
                      (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0),
                    )}
                  </p>
                )}
              </div>
              {editingId && (
                <p className="reminder-editing-hint">
                  Editing a reminder — click Update to save your changes.
                </p>
              )}
              <div className="action-buttons">
                <button className="btn-primary" onClick={submitReminder}>
                  {editingId ? "Update Reminder" : "Add Reminder"}
                </button>
                {editingId && (
                  <button className="btn-secondary" onClick={resetForm}>
                    Cancel Edit
                  </button>
                )}
                <button className="btn-secondary" onClick={handleTestNotification}>
                  Test Notification
                </button>
                <button className="btn-secondary" onClick={exportReminders}>
                  Export JSON
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  style={{ display: "none" }}
                  aria-label="Import reminders file"
                />
              </div>
              {status && (
                <p
                  className={
                    status.startsWith("Error")
                      ? "status-message error"
                      : "status-message success"
                  }
                >
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="glass-content reminders-list-wrapper">
          <div className="reminders-list-header">
            <h2 className="reminders-list-title">Reminders</h2>
            {reminders.length > 0 && (
              <button className="btn-secondary" onClick={clearAll}>
                Clear All
              </button>
            )}
          </div>
          {sortedReminders.length === 0 ? (
            <p className="reminders-empty">No reminders yet. Add one above.</p>
          ) : (
            <ul className="reminders-list">
              {sortedReminders.map((reminder) => (
                <li
                  className={`reminder-item${
                    editingId === reminder.id ? " editing" : ""
                  }${canSnooze(reminder) ? " overdue" : ""}`}
                  key={reminder.id}
                >
                  <div className="reminder-info">
                    <span className="reminder-title">{reminder.title}</span>
                    <span className="reminder-due">
                      Due {new Date(reminder.dueAt).toLocaleString()}
                    </span>
                    {reminder.repeat && (
                      <span className="reminder-repeat">
                        {reminder.intervalMs
                          ? `Repeats every ${formatTime(
                              Math.round(reminder.intervalMs / 1000),
                            )}`
                          : `Repeats ${formatRepeatDays(
                              reminder.repeatDays || [],
                            )}`}
                      </span>
                    )}
                  </div>
                  <span className="reminder-status">
                    {reminder.notified
                      ? "Sent"
                      : formatRemaining(reminder.dueAt) || "Due now"}
                  </span>
                  <div className="reminder-actions">
                    {canSnooze(reminder) && (
                      <>
                        <button
                          className="btn-secondary reminder-action"
                          aria-label={`Snooze ${reminder.title} 5 minutes`}
                          onClick={() => snoozeReminder(reminder.id, 5)}
                        >
                          Snooze 5m
                        </button>
                        <button
                          className="btn-secondary reminder-action"
                          aria-label={`Snooze ${reminder.title} 10 minutes`}
                          onClick={() => snoozeReminder(reminder.id, 10)}
                        >
                          Snooze 10m
                        </button>
                      </>
                    )}
                    <button
                      className="btn-secondary reminder-action"
                      aria-label={`Edit ${reminder.title}`}
                      onClick={() => startEdit(reminder)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-secondary reminder-delete"
                      aria-label={`Delete ${reminder.title}`}
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
