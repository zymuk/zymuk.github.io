import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import ReminderAlarm from "../../../../src/site/components/reminderAlarm/ReminderAlarm";

const mockNotification = (permission) => {
  const notificationMock = jest.fn();
  notificationMock.permission = permission;
  global.Notification = notificationMock;
  return notificationMock;
};

const clearNotificationMock = () => {
  delete global.Notification;
};

afterEach(() => {
  jest.useRealTimers();
  clearNotificationMock();
  delete navigator.serviceWorker;
});

describe("ReminderAlarm", () => {
  it("renders nothing when there are no ringing reminders", () => {
    const { container } = render(<ReminderAlarm />);
    expect(container).toBeEmptyDOMElement();
  });

  it("fires an OS notification when a reminder is due", async () => {
    jest.useFakeTimers();
    const notificationMock = mockNotification("granted");
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Stand up",
          dueAt: Date.now() + 5000,
          createdAt: Date.now(),
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(notificationMock).toHaveBeenCalledWith(
      "Stand up",
      expect.objectContaining({ body: "Reminder from Zymuk Page" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(true);
  });

  it("notifies about reminders missed while the page was closed", async () => {
    const notificationMock = mockNotification("granted");
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Missed task",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);
    await act(async () => {});

    expect(notificationMock).toHaveBeenCalledWith(
      "Missed task",
      expect.objectContaining({}),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(true);
  });

  it("shows the alarm popup for a ringing reminder and dismisses it", async () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Ring task",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);
    await act(async () => {});

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText("Ring task"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss all" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(true);
  });

  it("dismisses a single ringing reminder from the popup", async () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "First ring",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
          repeat: false,
        },
        {
          id: "2",
          title: "Second ring",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);
    await act(async () => {});

    const firstItem = within(screen.getByRole("dialog"))
      .getByText("First ring")
      .closest("li");
    fireEvent.click(
      within(firstItem).getByRole("button", { name: "Dismiss" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByText("First ring")).not.toBeInTheDocument();
    expect(within(dialog).getByText("Second ring")).toBeInTheDocument();
  });

  it("stops the alarm when the ringing reminder is snoozed", async () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Snooze ring",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);
    await act(async () => {});

    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Snooze 5m",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(false);
    expect(saved[0].dueAt).toBeGreaterThan(Date.now());
  });

  it("reschedules a countdown repeat reminder after it fires", async () => {
    jest.useFakeTimers();
    mockNotification("granted");
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Drink water",
          dueAt: now + 5000,
          createdAt: now,
          notified: false,
          repeat: true,
          intervalMs: 5000,
        },
      ]),
    );

    render(<ReminderAlarm />);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(false);
    expect(saved[0].dueAt).toBeGreaterThan(Date.now());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("reschedules a weekday repeat reminder when overdue", async () => {
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Weekly sync",
          dueAt: now - 1000,
          createdAt: now,
          notified: false,
          repeat: true,
          repeatDays: [0, 1, 2, 3, 4, 5, 6],
        },
      ]),
    );

    render(<ReminderAlarm />);
    await act(async () => {});

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(false);
    expect(saved[0].dueAt).toBeGreaterThan(now);
  });

  it("deletes a ringing reminder from the popup", async () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Delete ring",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);
    await act(async () => {});

    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("reminders"))).toHaveLength(0);
  });

  it("advances a reminder when the service worker snoozes it", () => {
    const listeners = {};
    navigator.serviceWorker = {
      addEventListener: (type, callback) => {
        listeners[type] = callback;
      },
      removeEventListener: jest.fn(),
    };
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "countdown",
          title: "Lunch",
          dueAt: now - 1000,
          createdAt: now,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);

    act(() => {
      listeners.message({
        data: { type: "REMINDER_SNOOZED", id: "1", snoozeMinutes: 5 },
      });
    });

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].dueAt).toBeGreaterThan(now + 4 * 60000);
    expect(saved[0].notified).toBe(false);
  });

  it("marks a reminder sent when the service worker shows it", () => {
    const listeners = {};
    navigator.serviceWorker = {
      addEventListener: (type, callback) => {
        listeners[type] = callback;
      },
      removeEventListener: jest.fn(),
    };
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Shown",
          dueAt: now - 1000,
          createdAt: now,
          notified: false,
          repeat: false,
        },
      ]),
    );

    render(<ReminderAlarm />);

    act(() => {
      listeners.message({
        data: { type: "REMINDER_SHOWN", id: "1" },
      });
    });

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(true);
  });
});
