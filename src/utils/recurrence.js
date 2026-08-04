const MS_PER_DAY = 24 * 60 * 60 * 1000;

const nextWeekdayOccurrence = (dueAt, repeatDays, now = Date.now()) => {
  const original = new Date(dueAt);
  const current = new Date(now);
  const hours = original.getHours();
  const minutes = original.getMinutes();
  const seconds = original.getSeconds();

  if (repeatDays.includes(current.getDay())) {
    const todayOccurrence = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
      hours,
      minutes,
      seconds,
      0,
    );
    if (todayOccurrence.getTime() > now) {
      return todayOccurrence.getTime();
    }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = new Date(
      original.getFullYear(),
      original.getMonth(),
      original.getDate() + offset,
      hours,
      minutes,
      seconds,
      0,
    );
    if (repeatDays.includes(candidate.getDay())) {
      return candidate.getTime();
    }
  }
  return dueAt + MS_PER_DAY;
};

const rescheduleRepeat = (reminder, now) => {
  if (!reminder.repeat) {
    return { ...reminder, notified: true };
  }
  let nextDueAt;
  if (reminder.intervalMs) {
    nextDueAt = now + reminder.intervalMs;
  } else {
    nextDueAt = nextWeekdayOccurrence(
      reminder.dueAt,
      reminder.repeatDays || [],
      now,
    );
  }
  return { ...reminder, dueAt: nextDueAt, notified: false };
};

export { nextWeekdayOccurrence, rescheduleRepeat };
