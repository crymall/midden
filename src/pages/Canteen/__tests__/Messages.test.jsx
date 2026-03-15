import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Messages from "../Messages";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

// Mock hooks
vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

vi.mock("../../../components/MiddenCard", () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe("Messages", () => {
  const mockGetThreads = vi.fn();

  const mockUser = { id: "1", username: "TestUser" };

  const mockThreads = [
    {
      other_user_id: "2",
      other_username: "Friend1",
      content: "Last message",
      created_at: new Date().toISOString(),
      sender_id: "2",
      is_read: false,
    },
    {
      other_user_id: "3",
      other_username: "Friend2",
      content: "Older message",
      created_at: new Date().toISOString(),
      sender_id: "1",
      is_read: true,
      recipe_id: "100",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: mockUser });
    useData.mockReturnValue({
      threads: mockThreads,
      getThreads: mockGetThreads,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Messages />
      </MemoryRouter>
    );
  };

  it("renders threads list", () => {
    renderComponent();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Friend1")).toBeInTheDocument();
    expect(screen.getByText("Last message")).toBeInTheDocument();
    expect(mockGetThreads).toHaveBeenCalled();
  });

  it("renders thread with recipe share text", () => {
    renderComponent();
    expect(screen.getByText("You shared a recipe: Older message")).toBeInTheDocument();
  });

  it("renders links to conversations", () => {
    renderComponent();
    const link = screen.getByText("Friend1").closest("a");
    expect(link).toHaveAttribute("href", "/applications/canteen/messages/2");
  });

  it("renders unread threads with unread indicators", () => {
    renderComponent();
    const friend1Link = screen.getByText("Friend1").closest("a");
    expect(friend1Link).toHaveClass("bg-accent/10");
    
    const friend2Link = screen.getByText("Friend2").closest("a");
    expect(friend2Link).not.toHaveClass("bg-accent/10");
  });

  it("handles empty threads", () => {
    useData.mockReturnValue({
      ...useData(),
      threads: [],
    });
    renderComponent();
    expect(screen.getByText("No conversations yet.")).toBeInTheDocument();
  });
});