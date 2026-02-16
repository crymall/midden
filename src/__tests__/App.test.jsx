import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import useAuth from "../context/auth/useAuth";

// Mock providers to avoid complex logic and API calls
vi.mock("../context/auth/AuthProvider", () => ({
  default: ({ children }) => <>{children}</>,
}));
vi.mock("../context/data/DataProvider", () => ({
  default: ({ children }) => <>{children}</>,
}));

// Mock useAuth to control authentication state
vi.mock("../context/auth/useAuth");

// Mock page components
vi.mock("../pages/Login", () => ({ default: () => <div>Login Page</div> }));
vi.mock("../pages/Explorer", () => ({ default: () => <div>Explorer Page</div> }));
vi.mock("../pages/Settings", () => ({ default: () => <div>Settings Page</div> }));
vi.mock("../pages/Experiments", () => ({ default: () => <div>Experiments Page</div> }));
vi.mock("../pages/NotFound", () => ({ default: () => <div>NotFound Page</div> }));

// Mock Header
vi.mock("../components/Header", () => ({ default: () => <div>Header Component</div> }));

describe("App Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Login page at /login", () => {
    window.history.pushState({}, "Login", "/login");
    useAuth.mockReturnValue({ user: null });
    render(<App />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to login when accessing protected route unauthenticated", () => {
    window.history.pushState({}, "Home", "/");
    useAuth.mockReturnValue({ user: null });
    render(<App />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders Dashboard and Explorer when authenticated at /", () => {
    window.history.pushState({}, "Home", "/");
    useAuth.mockReturnValue({ user: { username: "testuser" } });
    render(<App />);
    expect(screen.getByText("Header Component")).toBeInTheDocument();
    expect(screen.getByText("Explorer Page")).toBeInTheDocument();
  });

  it("renders Settings page when authenticated and not guest", () => {
    window.history.pushState({}, "Settings", "/settings");
    useAuth.mockReturnValue({ user: { username: "testuser" } });
    render(<App />);
    expect(screen.getByText("Settings Page")).toBeInTheDocument();
  });

  it("redirects guest user from Settings to Home", () => {
    window.history.pushState({}, "Settings", "/settings");
    useAuth.mockReturnValue({ user: { username: "guest" } });
    render(<App />);
    // Should redirect to / which renders Explorer
    expect(screen.queryByText("Settings Page")).not.toBeInTheDocument();
    expect(screen.getByText("Explorer Page")).toBeInTheDocument();
  });

  it("renders Experiments page", () => {
    window.history.pushState({}, "Experiments", "/experiments");
    useAuth.mockReturnValue({ user: { username: "testuser" } });
    render(<App />);
    expect(screen.getByText("Experiments Page")).toBeInTheDocument();
  });

  it("renders 404 for unknown routes when authenticated", () => {
    window.history.pushState({}, "404", "/random-route");
    useAuth.mockReturnValue({ user: { username: "testuser" } });
    render(<App />);
    expect(screen.getByText("NotFound Page")).toBeInTheDocument();
  });
});