import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Settings from "../../../src/admin/pages/Settings";

const EN = {
  settings_title: "Settings",
  settings_description: "Admin system configuration.",
  export_data: "Export data.json",
  export_description: "Export current data as JSON file",
};

describe("Settings (export data)", () => {
  beforeEach(() => {
    const data = { users: [{ id: 1, email: "a@b.com" }], projects: [] };
    global.fetch = jest.fn((url) => {
      const u = String(url);
      if (u.includes("en.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(EN) });
      }
      if (u.includes("data.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    URL.createObjectURL = jest.fn(() => "blob:fake-url");
    URL.revokeObjectURL = jest.fn();
    jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  const flushAsync = () =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

  const renderSettings = async () => {
    const view = render(<Settings />);
    await flushAsync();
    return view;
  };

  it("caches the fetched data into localStorage", async () => {
    await renderSettings();
    await waitFor(() =>
      expect(localStorage.getItem("site_data")).toBeTruthy(),
    );
    const cached = JSON.parse(localStorage.getItem("site_data"));
    expect(cached.users).toHaveLength(1);
  });

  it("exports the loaded data as a JSON download", async () => {
    await renderSettings();
    await waitFor(() =>
      expect(localStorage.getItem("site_data")).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("button", { name: /export data.json/i }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });

  it("reuses cached data and does not refetch when present", async () => {
    localStorage.setItem("site_data", JSON.stringify({ users: [], cached: true }));
    await renderSettings();

    fireEvent.click(screen.getByRole("button", { name: /export data.json/i }));

    const calls = global.fetch.mock.calls.map((c) => String(c[0]));
    expect(calls.some((u) => u.includes("data.json"))).toBe(false);
  });
});
