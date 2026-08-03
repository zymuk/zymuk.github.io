import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Users from "../../../src/admin/pages/Users";

const EN = {
  fill_required_fields: "Please fill all required fields!",
  email_exists_error: "This email is already in use!",
  user_added_success: "User added successfully!",
  user_updated_success: "User updated successfully!",
  user_deleted_success: "User deleted successfully!",
  add_user: "Add User",
  update_user: "Update User",
  no_users: "No users found",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
};

const mockFetch = (users) => {
  global.fetch = jest.fn((url) => {
    const u = String(url);
    if (u.includes("en.json")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(EN) });
    }
    if (u.includes("data.json")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ users }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
};

const flushAsync = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const renderUsers = async () => {
  const view = render(<Users />);
  await flushAsync();
  return view;
};

const getInputs = (container) => ({
  email: container.querySelector('input[name="email"]'),
  password: container.querySelector('input[name="password"]'),
  role: container.querySelector('select[name="role"]'),
});

const fillForm = (container, { email, password, role }) => {
  const inputs = getInputs(container);
  fireEvent.change(inputs.email, { target: { value: email } });
  fireEvent.change(inputs.password, { target: { value: password } });
  fireEvent.change(inputs.role, { target: { value: role } });
};

const submitForm = (container) =>
  fireEvent.submit(container.querySelector("form"));

const storedUsers = () => JSON.parse(localStorage.getItem("users"));

describe("Users (admin CRUD)", () => {
  beforeEach(() => {
    mockFetch([]);
  });

  it("shows the empty list when there are no users", async () => {
    localStorage.setItem("users", "[]");
    await renderUsers();
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("adds a user and persists it to localStorage", async () => {
    localStorage.setItem("users", "[]");
    const { container } = await renderUsers();

    fillForm(container, {
      email: "tester@zymuk.com",
      password: "secret123",
      role: "user",
    });
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));

    expect(screen.getByText("tester@zymuk.com")).toBeInTheDocument();
    expect(screen.getByText(/user added successfully/i)).toBeInTheDocument();
    expect(storedUsers()).toEqual([
      { email: "tester@zymuk.com", password: "secret123", role: "user" },
    ]);
  });

  it("rejects a form with missing required fields", async () => {
    localStorage.setItem("users", "[]");
    const { container } = await renderUsers();
    submitForm(container);
    expect(
      screen.getByText(/please fill all required fields/i),
    ).toBeInTheDocument();
    expect(storedUsers()).toEqual([]);
  });

  it("rejects a duplicate email", async () => {
    localStorage.setItem(
      "users",
      JSON.stringify([
        { email: "a@b.com", password: "pass", role: "user" },
      ]),
    );
    const { container } = await renderUsers();

    fillForm(container, {
      email: "A@B.com",
      password: "another",
      role: "user",
    });
    submitForm(container);

    expect(screen.getByText(/email is already in use/i)).toBeInTheDocument();
    expect(storedUsers()).toHaveLength(1);
  });

  it("edits an existing user", async () => {
    localStorage.setItem(
      "users",
      JSON.stringify([
        { email: "a@b.com", password: "pass", role: "user" },
      ]),
    );
    const { container } = await renderUsers();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(getInputs(container).email.value).toBe("a@b.com");

    fireEvent.change(getInputs(container).email, {
      target: { value: "new@b.com" },
    });
    fireEvent.change(getInputs(container).role, {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update user/i }));

    expect(screen.getByText("new@b.com")).toBeInTheDocument();
    expect(screen.getByText(/user updated successfully/i)).toBeInTheDocument();
    expect(storedUsers()).toEqual([
      { email: "new@b.com", password: "pass", role: "admin" },
    ]);
  });

  it("cancels editing and resets the form", async () => {
    localStorage.setItem(
      "users",
      JSON.stringify([{ email: "a@b.com", password: "pass", role: "user" }]),
    );
    const { container } = await renderUsers();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(getInputs(container).email.value).toBe("");
    expect(
      screen.getByRole("button", { name: /add user/i }),
    ).toBeInTheDocument();
  });

  it("deletes a user after confirmation", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    localStorage.setItem(
      "users",
      JSON.stringify([
        { email: "a@b.com", password: "pass", role: "user" },
      ]),
    );
    await renderUsers();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.queryByText("a@b.com")).not.toBeInTheDocument();
    expect(screen.getByText(/user deleted successfully/i)).toBeInTheDocument();
    expect(storedUsers()).toEqual([]);
  });

  it("keeps the user when deletion is cancelled", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    localStorage.setItem(
      "users",
      JSON.stringify([{ email: "a@b.com", password: "pass", role: "user" }]),
    );
    await renderUsers();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.getByText("a@b.com")).toBeInTheDocument();
    expect(storedUsers()).toHaveLength(1);
  });
});
