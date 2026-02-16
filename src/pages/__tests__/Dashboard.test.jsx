import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "../Dashboard";
import useAuth from "../../context/auth/useAuth";
import { navMeta } from "../../utils/constants";

vi.mock("../../context/auth/useAuth");

describe("Dashboard Component", () => {
  it("renders the header with user information", () => {
    useAuth.mockReturnValue({
      user: { username: "testuser" },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard navMeta={navMeta.midden} />
      </MemoryRouter>
    );

    expect(screen.getByText("Midden")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });
});