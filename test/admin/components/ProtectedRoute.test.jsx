import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../../../src/admin/components/ProtectedRoute";
import { useAuth } from "../../../src/admin/AuthContext";

jest.mock("../../../src/admin/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={["/admin/users"]}>
      <ProtectedRoute>
        <div>protected content</div>
      </ProtectedRoute>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuth.mockReset();
  });

  it("renders children when a user is logged in", () => {
    useAuth.mockReturnValue({ user: { email: "a@b.com", role: "admin" } });
    renderRoute();
    expect(screen.getByText("protected content")).toBeInTheDocument();
  });

  it("redirects to /admin/login when no user is present", () => {
    useAuth.mockReturnValue({ user: null });
    renderRoute();
    expect(screen.queryByText("protected content")).not.toBeInTheDocument();
  });
});
