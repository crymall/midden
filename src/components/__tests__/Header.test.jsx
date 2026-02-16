import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Header from "../Header";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Header Component", () => {
  const mockLogout = vi.fn();
  const user = { username: "testuser" };
  const defaultProps = {
    user,
    logout: mockLogout,
    title: "Midden",
    titleLink: "/",
    navLinks: [],
  };

  it("renders user information", () => {
    render(
      <MemoryRouter>
        <Header {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText("Midden")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("navigates to settings when settings button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header {...defaultProps} />
      </MemoryRouter>
    );
    
    const settingsBtn = screen.getByRole("button", { name: /settings/i });
    await user.click(settingsBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });

  it("calls logout and navigates to login when logout button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header {...defaultProps} />
      </MemoryRouter>
    );
    
    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("does not show settings button for guest user", () => {
    const guestUser = { username: "guest" };
    render(
      <MemoryRouter>
        <Header {...defaultProps} user={guestUser} />
      </MemoryRouter>
    );
    expect(screen.queryByRole("button", { name: /settings/i })).not.toBeInTheDocument();
  });

  it("renders navigation links when provided", () => {
    const navLinks = [
      { to: "/test", label: "Test Link", ariaLabel: "Test" },
    ];
    render(
      <MemoryRouter>
        <Header {...defaultProps} navLinks={navLinks} />
      </MemoryRouter>
    );
    expect(screen.getByText("Test Link")).toBeInTheDocument();
  });
});