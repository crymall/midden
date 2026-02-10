import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import RequireNotGuest from "../RequireNotGuest";
import useAuth from "../../../context/auth/useAuth";

vi.mock("../../../context/auth/useAuth");

describe("RequireNotGuest Gateway", () => {
  it("renders outlet content if user is authenticated and not guest", () => {
    useAuth.mockReturnValue({ user: { username: "regularUser" } });

    render(
      <MemoryRouter initialEntries={["/restricted"]}>
        <Routes>
          <Route element={<RequireNotGuest />}>
            <Route path="/restricted" element={<div>Restricted Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Restricted Content")).toBeInTheDocument();
  });

  it("redirects to home if user is guest", () => {
    useAuth.mockReturnValue({ user: { username: "guest" } });

    render(
      <MemoryRouter initialEntries={["/restricted"]}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<RequireNotGuest />}>
            <Route path="/restricted" element={<div>Restricted Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("redirects to home if user is null", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={["/restricted"]}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<RequireNotGuest />}>
            <Route path="/restricted" element={<div>Restricted Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});