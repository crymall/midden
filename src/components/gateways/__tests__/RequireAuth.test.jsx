import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import RequireAuth from "../RequireAuth";
import useAuth from "../../../context/auth/useAuth";

vi.mock("../../../context/auth/useAuth");

describe("RequireAuth Gateway", () => {
  it("renders outlet content if user is authenticated", () => {
    useAuth.mockReturnValue({ user: { username: "test" } });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to login if user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});