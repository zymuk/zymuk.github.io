import {
  nextWeekdayOccurrence,
  rescheduleRepeat,
} from "../../src/utils/recurrence";

describe("nextWeekdayOccurrence", () => {
  const MON_1500 = new Date(2026, 7, 3, 15, 0, 0).getTime();

  it("returns the next matching weekday after the due date", () => {
    const next = nextWeekdayOccurrence(MON_1500, [1], MON_1500);
    expect(next).toBe(new Date(2026, 7, 10, 15, 0, 0).getTime());
  });

  it("picks the soonest selected weekday", () => {
    const next = nextWeekdayOccurrence(MON_1500, [1, 3], MON_1500);
    expect(next).toBe(new Date(2026, 7, 5, 15, 0, 0).getTime());
  });

  it("uses today when its occurrence has not passed yet", () => {
    const dueAt = new Date(2026, 7, 3, 9, 0, 0).getTime();
    const now = new Date(2026, 7, 3, 8, 0, 0).getTime();
    const next = nextWeekdayOccurrence(dueAt, [1], now);
    expect(next).toBe(dueAt);
  });
});

describe("rescheduleRepeat", () => {
  it("reschedules a countdown repeat by its interval", () => {
    const now = new Date(2026, 7, 3, 10, 0, 0).getTime();
    const next = rescheduleRepeat(
      { id: "1", repeat: true, intervalMs: 60000, dueAt: now },
      now,
    );
    expect(next.dueAt).toBe(now + 60000);
    expect(next.notified).toBe(false);
  });

  it("reschedules a weekday repeat to its next weekday", () => {
    const dueAt = new Date(2026, 7, 3, 15, 0, 0).getTime();
    const next = rescheduleRepeat(
      { id: "1", repeat: true, repeatDays: [1], dueAt },
      dueAt,
    );
    expect(next.dueAt).toBe(new Date(2026, 7, 10, 15, 0, 0).getTime());
    expect(next.notified).toBe(false);
  });

  it("marks a one-shot reminder as notified", () => {
    const next = rescheduleRepeat({ id: "1", repeat: false, dueAt: 0 }, 1000);
    expect(next.notified).toBe(true);
  });
});
