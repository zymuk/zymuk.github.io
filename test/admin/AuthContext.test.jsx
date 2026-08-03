import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/admin/AuthContext";

const Consumer = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="email">{user ? user.email : "anonymous"}</span>
      <button onClick={() => login({ email: "a@b.com", role: "admin" })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );

describe("AuthContext", () => {
  it("starts with no logged-in user", () => {
    renderWithProvider();
    expect(screen.getByTestId("email").textContent).toBe("anonymous");
  });

  it("logs in, exposes the user and persists it to localStorage", () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "login" }));

    expect(screen.getByTestId("email").textContent).toBe("a@b.com");
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      email: "a@b.com",
      role: "admin",
    });
  });

  it("logs out, clears the user and localStorage", () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "login" }));
    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("email").textContent).toBe("anonymous");
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("restores the user from localStorage on mount", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "restored@b.com", role: "admin" }),
    );
    renderWithProvider();
    expect(screen.getByTestId("email").textContent).toBe("restored@b.com");
  });
});
