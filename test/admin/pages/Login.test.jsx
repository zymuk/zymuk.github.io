import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../../../src/admin/pages/Login";

const EN = {
  login_success: "Login successful!",
  login_error: "Invalid email or password!",
  enter_email: "Enter email",
  enter_password: "Enter password",
  login_button: "Login",
};

const ADMIN_USER = {
  email: "admin@zymuk.com",
  password: "password123",
  role: "admin",
};

const renderLogin = async () => {
  const view = render(
    <MemoryRouter initialEntries={["/admin/login"]}>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<div>admin home</div>} />
      </Routes>
    </MemoryRouter>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return view;
};

const loginAs = async (email, password) => {
  fireEvent.change(screen.getByPlaceholderText("Enter email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
};

describe("Login", () => {
  beforeEach(() => {
    localStorage.setItem("users", JSON.stringify([ADMIN_USER]));
    global.fetch = jest.fn((url) => {
      if (String(url).includes("en.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(EN) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("logs in with valid credentials, stores a session and redirects", async () => {
    await renderLogin();

    await loginAs("admin@zymuk.com", "password123");

    expect(await screen.findByText("admin home")).toBeInTheDocument();
    expect(localStorage.getItem("admin_token")).toMatch(/^[0-9a-f]{32}$/);
    expect(localStorage.getItem("admin_token_exp")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("user"))).toEqual(ADMIN_USER);
    expect(window.alert).toHaveBeenCalledWith("Login successful!");
  });

  it("shows an error and stores no token for invalid credentials", async () => {
    await renderLogin();

    await loginAs("admin@zymuk.com", "wrong-password");

    expect(
      await screen.findByText("Invalid email or password!"),
    ).toBeInTheDocument();
    expect(localStorage.getItem("admin_token")).toBeNull();
  });

  it("does not redirect when there is no existing session", async () => {
    await renderLogin();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(screen.queryByText("admin home")).not.toBeInTheDocument();
  });
});
