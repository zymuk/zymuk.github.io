import React from "react";
import { render, screen, fireEvent, act, waitFor, within } from "@testing-library/react";
import Reminders from "../../../../src/site/pages/reminders/Reminders";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const setTitle = (value) =>
  fireEvent.change(screen.getByLabelText("Title (optional)"), {
    target: { value },
  });

const setSeconds = (value) =>
  fireEvent.change(screen.getByLabelText("Seconds"), {
    target: { value: String(value) },
  });

const clickAdd = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Add Reminder" }));
  });
};

const clickUpdate = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Update Reminder" }));
  });
};

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
  delete global.URL.createObjectURL;
  delete global.URL.revokeObjectURL;
  delete navigator.serviceWorker;
});

describe("Reminders", () => {
  it("renders the add form and empty list", () => {
    render(<Reminders />);

    expect(screen.getByText("Task Reminder")).toBeInTheDocument();
    expect(screen.getByLabelText("Title (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Seconds")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Reminder" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Test Notification" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No reminders yet. Add one above."),
    ).toBeInTheDocument();
  });

  it("switches between countdown and specific time modes", () => {
    render(<Reminders />);

    fireEvent.click(screen.getByLabelText("Specific time"));
    expect(screen.getByLabelText("Remind at")).toBeInTheDocument();
    expect(screen.queryByLabelText("Seconds")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Countdown"));
    expect(screen.getByLabelText("Seconds")).toBeInTheDocument();
  });

  it("adds a reminder without a title using a fallback label", async () => {
    render(<Reminders />);
    setSeconds(60);
    await clickAdd();

    expect(
      screen.queryByText(/Please enter a task title/),
    ).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].title).toBe("Reminder");
    expect(screen.getByText("Reminder")).toBeInTheDocument();
  });

  it("rejects a specific time in the past", async () => {
    render(<Reminders />);
    fireEvent.click(screen.getByLabelText("Specific time"));
    setTitle("Past task");
    fireEvent.change(screen.getByLabelText("Remind at"), {
      target: { value: "2000-01-01T10:00" },
    });
    await clickAdd();

    expect(screen.getByText(/must be in the future/)).toBeInTheDocument();
    expect(screen.queryByText("Past task")).not.toBeInTheDocument();
  });

  it("adds a countdown reminder and persists it in localStorage", async () => {
    render(<Reminders />);
    setTitle("Call the client");
    setSeconds(30);
    await clickAdd();

    expect(screen.getByText("Call the client")).toBeInTheDocument();
    expect(screen.getByText("00:00:30")).toBeInTheDocument();
    expect(
      screen.getByText(/The reminder was still added/),
    ).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("Call the client");
    expect(saved[0].notified).toBe(false);
  });

  it("adds a reminder at a specific future time", async () => {
    render(<Reminders />);
    fireEvent.click(screen.getByLabelText("Specific time"));
    setTitle("Meeting");
    const future = new Date(Date.now() + 3600 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const value =
      `${future.getFullYear()}-${pad(future.getMonth() + 1)}-` +
      `${pad(future.getDate())}T${pad(future.getHours())}:${pad(
        future.getMinutes(),
      )}`;
    fireEvent.change(screen.getByLabelText("Remind at"), {
      target: { value },
    });
    await clickAdd();

    expect(screen.getByText("Meeting")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved).toHaveLength(1);
    expect(saved[0].dueAt).toBeGreaterThan(Date.now());
  });

  it("fires an OS notification when a reminder is due", async () => {
    jest.useFakeTimers();
    const notificationMock = mockNotification("granted");

    render(<Reminders />);
    setTitle("Stand up");
    setSeconds(5);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add Reminder" }));
    });

    expect(screen.getByText("Stand up")).toBeInTheDocument();
    expect(screen.getByText("00:00:05")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(notificationMock).toHaveBeenCalledWith(
      "Stand up",
      expect.objectContaining({ body: "Reminder from Zymuk Page" }),
    );
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("deletes a single reminder", async () => {
    render(<Reminders />);
    setTitle("Delete me");
    setSeconds(60);
    await clickAdd();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Delete me" }),
    );

    expect(screen.queryByText("Delete me")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("reminders"))).toHaveLength(0);
  });

  it("clears all reminders", async () => {
    render(<Reminders />);
    setTitle("First");
    setSeconds(60);
    await clickAdd();
    setTitle("Second");
    setSeconds(120);
    await clickAdd();

    fireEvent.click(screen.getByRole("button", { name: "Clear All" }));

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
    expect(screen.getByText("All reminders cleared.")).toBeInTheDocument();
  });

  it("sends a test notification when permission is granted", async () => {
    const notificationMock = mockNotification("granted");

    render(<Reminders />);
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Test Notification" }),
      );
    });

    expect(notificationMock).toHaveBeenCalledWith(
      "Test Notification",
      expect.objectContaining({}),
    );
    expect(screen.getByText(/Test notification sent/)).toBeInTheDocument();
  });

  it("shows an error when notification permission is denied", async () => {
    mockNotification("denied");

    render(<Reminders />);
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Test Notification" }),
      );
    });

    expect(
      screen.getByText(/Notification permission denied/),
    ).toBeInTheDocument();
  });

  it("shows an error when notifications are unsupported", async () => {
    clearNotificationMock();

    render(<Reminders />);
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Test Notification" }),
      );
    });

    expect(
      screen.getByText(/OS notifications are not supported/),
    ).toBeInTheDocument();
  });

  it("restores reminders from localStorage", () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Future task",
          dueAt: Date.now() + 60000,
          createdAt: Date.now(),
          notified: false,
        },
      ]),
    );

    render(<Reminders />);

    expect(screen.getByText("Future task")).toBeInTheDocument();
    expect(screen.getByText(/Due/)).toBeInTheDocument();
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
        },
      ]),
    );

    render(<Reminders />);
    await act(async () => {});

    expect(notificationMock).toHaveBeenCalledWith(
      "Missed task",
      expect.objectContaining({}),
    );
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("shows the repeat day options when repeat is on for specific time", () => {
    render(<Reminders />);
    fireEvent.click(screen.getByLabelText("Specific time"));
    fireEvent.click(screen.getByLabelText("Repeat"));

    WEEKDAY_LABELS.forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
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
        },
      ]),
    );

    render(<Reminders />);
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
        },
        {
          id: "2",
          title: "Second ring",
          dueAt: Date.now() - 1000,
          createdAt: Date.now() - 2000,
          notified: false,
        },
      ]),
    );

    render(<Reminders />);
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
        },
      ]),
    );

    render(<Reminders />);
    await act(async () => {});

    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Snooze 5m",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the repeat interval hint for countdown", () => {
    render(<Reminders />);
    setSeconds(30);
    fireEvent.click(screen.getByLabelText("Repeat"));

    expect(screen.getByText(/Will repeat every 00:00:30/)).toBeInTheDocument();
  });

  it("applies a countdown preset to the time fields", async () => {
    render(<Reminders />);

    fireEvent.click(screen.getByRole("button", { name: "30 min" }));

    expect(screen.getByLabelText("Minutes")).toHaveValue(30);
    setTitle("Quick break");
    await clickAdd();

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].durationMs).toBe(1800000);
  });

  it("applies an absolute preset about one hour from now", () => {
    render(<Reminders />);
    fireEvent.click(screen.getByLabelText("Specific time"));

    fireEvent.click(screen.getByRole("button", { name: "In 1 hour" }));

    const parsed = new Date(screen.getByLabelText("Remind at").value).getTime();
    expect(parsed).toBeGreaterThan(Date.now() + 59 * 60000);
    expect(parsed).toBeLessThanOrEqual(Date.now() + 61 * 60000);
  });

  it("applies the tomorrow 9 AM preset", () => {
    render(<Reminders />);
    fireEvent.click(screen.getByLabelText("Specific time"));

    fireEvent.click(screen.getByRole("button", { name: "Tomorrow 9 AM" }));

    const [datePart, timePart] = screen
      .getByLabelText("Remind at")
      .value.split("T");
    expect(timePart).toBe("09:00");
    const expected = new Date();
    expected.setDate(expected.getDate() + 1);
    const pad = (n) => String(n).padStart(2, "0");
    expect(datePart).toBe(
      `${expected.getFullYear()}-${pad(expected.getMonth() + 1)}-${pad(
        expected.getDate(),
      )}`,
    );
  });

  it("rejects a specific-time repeat without any day selected", async () => {
    render(<Reminders />);
    fireEvent.click(screen.getByLabelText("Specific time"));
    setTitle("Daily task");
    fireEvent.click(screen.getByLabelText("Repeat"));
    const future = new Date(Date.now() + 3600 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    fireEvent.change(screen.getByLabelText("Remind at"), {
      target: {
        value:
          `${future.getFullYear()}-${pad(future.getMonth() + 1)}-` +
          `${pad(future.getDate())}T${pad(future.getHours())}:${pad(
            future.getMinutes(),
          )}`,
      },
    });
    await clickAdd();

    expect(screen.getByText(/at least one repeat day/)).toBeInTheDocument();
    expect(screen.queryByText("Daily task")).not.toBeInTheDocument();
  });

  it("saves a countdown repeat reminder with its interval", async () => {
    render(<Reminders />);
    setTitle("Stretch");
    setSeconds(30);
    fireEvent.click(screen.getByLabelText("Repeat"));
    await clickAdd();

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved).toHaveLength(1);
    expect(saved[0].repeat).toBe(true);
    expect(saved[0].intervalMs).toBe(30000);
  });

  it("reschedules a countdown repeat reminder after it fires", async () => {
    jest.useFakeTimers();
    mockNotification("granted");

    render(<Reminders />);
    setTitle("Drink water");
    setSeconds(5);
    fireEvent.click(screen.getByLabelText("Repeat"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add Reminder" }));
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Sent")).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(false);
    expect(saved[0].dueAt).toBeGreaterThan(Date.now());
  });

  it("saves a weekday repeat reminder and reschedules it when overdue", async () => {
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

    render(<Reminders />);

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(false);
    expect(saved[0].dueAt).toBeGreaterThan(now);
    expect(screen.getByText("Weekly sync")).toBeInTheDocument();
    expect(screen.queryByText("Sent")).not.toBeInTheDocument();
  });

  it("edits a reminder and updates it in localStorage", async () => {
    mockNotification("granted");
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "countdown",
          title: "Old title",
          dueAt: Date.now() + 60000,
          createdAt: Date.now(),
          durationMs: 60000,
          notified: false,
          repeat: false,
        },
      ]),
    );
    render(<Reminders />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Old title" }));
    expect(screen.getByLabelText("Title (optional)")).toHaveValue("Old title");
    expect(
      screen.getByRole("button", { name: "Update Reminder" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Editing a reminder/),
    ).toBeInTheDocument();

    setTitle("New title");
    await clickUpdate();

    expect(screen.getByText("New title")).toBeInTheDocument();
    expect(screen.queryByText("Old title")).not.toBeInTheDocument();
    expect(screen.getByText("Reminder updated.")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("New title");
  });

  it("cancels editing and clears the form", () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "countdown",
          title: "Old title",
          dueAt: Date.now() + 60000,
          createdAt: Date.now(),
          durationMs: 60000,
          notified: false,
          repeat: false,
        },
      ]),
    );
    render(<Reminders />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Old title" }));
    expect(
      screen.getByRole("button", { name: "Update Reminder" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel Edit" }));

    expect(screen.getByLabelText("Title (optional)")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Add Reminder" }),
    ).toBeInTheDocument();
  });

  it("prefills the form when editing a specific-time reminder", () => {
    const dueAt = Date.now() + 3600 * 1000;
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "absolute",
          title: "Meeting",
          dueAt,
          createdAt: Date.now(),
          notified: false,
          repeat: false,
        },
      ]),
    );
    render(<Reminders />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Meeting" }));

    const d = new Date(dueAt);
    const pad = (n) => String(n).padStart(2, "0");
    expect(screen.getByLabelText("Remind at")).toHaveValue(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    );
  });

  it("prefills repeat days when editing a repeating reminder", () => {
    const dueAt = Date.now() + 3600 * 1000;
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "absolute",
          title: "Standup",
          dueAt,
          createdAt: Date.now(),
          notified: false,
          repeat: true,
          repeatDays: [1, 3],
        },
      ]),
    );
    render(<Reminders />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Standup" }));

    expect(screen.getByLabelText("Repeat")).toBeChecked();
    expect(screen.getByLabelText("Mon")).toBeChecked();
    expect(screen.getByLabelText("Wed")).toBeChecked();
    expect(screen.getByLabelText("Tue")).not.toBeChecked();
  });

  it("snoozes a due reminder by 5 minutes", async () => {
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "countdown",
          title: "Stretch",
          dueAt: now - 1000,
          createdAt: now,
          notified: false,
          repeat: false,
        },
      ]),
    );
    render(<Reminders />);

    fireEvent.click(
      screen.getByRole("button", { name: "Snooze Stretch 5 minutes" }),
    );

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].dueAt).toBeGreaterThan(now + 4 * 60000);
    expect(saved[0].dueAt).toBeLessThanOrEqual(now + 5 * 60000 + 1000);
    expect(saved[0].notified).toBe(false);
    expect(
      screen.getByText(/snoozed for 5 minutes/i),
    ).toBeInTheDocument();
  });

  it("allows snoozing a reminder that was already sent", () => {
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "countdown",
          title: "Done task",
          dueAt: now - 5000,
          createdAt: now,
          notified: true,
          repeat: false,
        },
      ]),
    );
    render(<Reminders />);

    expect(screen.getByText("Sent")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Snooze Done task 10 minutes" }),
    );

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].notified).toBe(false);
    expect(saved[0].dueAt).toBeGreaterThan(now);
  });

  it("does not show snooze for repeating reminders", () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "absolute",
          title: "Daily",
          dueAt: Date.now() - 1000,
          createdAt: Date.now(),
          notified: false,
          repeat: true,
          repeatDays: [0, 1, 2, 3, 4, 5, 6],
        },
      ]),
    );
    render(<Reminders />);

    expect(screen.queryByRole("button", { name: /Snooze/ })).not.toBeInTheDocument();
  });

  it("highlights overdue reminders with a highlight class", () => {
    const now = Date.now();
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          kind: "countdown",
          title: "Old task",
          dueAt: now - 1000,
          createdAt: now,
          notified: true,
          repeat: false,
        },
        {
          id: "2",
          kind: "countdown",
          title: "Future task",
          dueAt: now + 60000,
          createdAt: now,
          notified: false,
          repeat: false,
        },
      ]),
    );

    const { container } = render(<Reminders />);

    const overdueItems = container.querySelectorAll(".reminder-item.overdue");
    expect(overdueItems).toHaveLength(1);
    expect(overdueItems[0].textContent).toContain("Old task");
    expect(screen.getByText("Future task")).toBeInTheDocument();
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

    render(<Reminders />);

    act(() => {
      listeners.message({
        data: { type: "REMINDER_SNOOZED", id: "1", snoozeMinutes: 5 },
      });
    });

    const saved = JSON.parse(localStorage.getItem("reminders"));
    expect(saved[0].dueAt).toBeGreaterThan(now + 4 * 60000);
    expect(saved[0].notified).toBe(false);
  });

  it("imports reminders from a JSON file", async () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Existing",
          dueAt: Date.now() + 60000,
          createdAt: Date.now(),
          notified: false,
        },
      ]),
    );
    render(<Reminders />);

    const file = new File(
      [
        JSON.stringify([
          {
            id: "2",
            title: "Imported task",
            dueAt: Date.now() + 120000,
            createdAt: Date.now(),
            notified: false,
          },
        ]),
      ],
      "backup.json",
      { type: "application/json" },
    );
    await act(async () => {
      fireEvent.change(
        screen.getByLabelText("Import reminders file"),
        { target: { files: [file] } },
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Imported task")).toBeInTheDocument();
    });
    expect(screen.getByText("Existing")).toBeInTheDocument();
    expect(screen.getByText("Imported 1 reminder(s).")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("reminders"))).toHaveLength(2);
  });

  it("replaces an existing reminder on import with the same id", async () => {
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Old name",
          dueAt: Date.now() + 60000,
          createdAt: Date.now(),
          notified: false,
        },
      ]),
    );
    render(<Reminders />);

    const file = new File(
      [
        JSON.stringify([
          {
            id: "1",
            title: "New name",
            dueAt: Date.now() + 60000,
            createdAt: Date.now(),
            notified: false,
          },
        ]),
      ],
      "backup.json",
      { type: "application/json" },
    );
    await act(async () => {
      fireEvent.change(
        screen.getByLabelText("Import reminders file"),
        { target: { files: [file] } },
      );
    });

    await waitFor(() => {
      expect(screen.getByText("New name")).toBeInTheDocument();
    });
    expect(screen.queryByText("Old name")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("reminders"))).toHaveLength(1);
  });

  it("shows an error for an invalid backup file", async () => {
    render(<Reminders />);

    const file = new File(["not json"], "backup.json", {
      type: "application/json",
    });
    await act(async () => {
      fireEvent.change(
        screen.getByLabelText("Import reminders file"),
        { target: { files: [file] } },
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Could not read the backup file/),
      ).toBeInTheDocument();
    });
  });

  it("exports reminders as a downloadable JSON file", () => {
    const createUrl = jest.fn(() => "blob:mock");
    const revokeUrl = jest.fn();
    global.URL.createObjectURL = createUrl;
    global.URL.revokeObjectURL = revokeUrl;
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    localStorage.setItem(
      "reminders",
      JSON.stringify([
        {
          id: "1",
          title: "Export me",
          dueAt: Date.now() + 60000,
          createdAt: Date.now(),
          notified: false,
        },
      ]),
    );
    render(<Reminders />);

    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));

    expect(createUrl).toHaveBeenCalledTimes(1);
    const blob = createUrl.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
    expect(blob.size).toBeGreaterThan(0);
    expect(screen.getByText("Exported 1 reminder(s).")).toBeInTheDocument();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeUrl).toHaveBeenCalledWith("blob:mock");
    clickSpy.mockRestore();
  });

  it("does not export when there are no reminders", () => {
    const createUrl = jest.fn();
    global.URL.createObjectURL = createUrl;

    render(<Reminders />);
    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));

    expect(createUrl).not.toHaveBeenCalled();
    expect(screen.getByText("Nothing to export yet.")).toBeInTheDocument();
  });
});
