import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Messages from "../Messages";
import useData from "../../../context/data/useData";

// Mock hooks
vi.mock("../../../context/data/useData");

vi.mock("../../../components/MiddenCard", () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe("Messages", () => {
  const mockGetThreads = vi.fn();

  const mockThreads = [
    {
      other_user_id: "2",
      other_username: "Friend1",
      content: "Last message",
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useData.mockReturnValue({
      threads: mockThreads,
      getThreads: mockGetThreads,
    });

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
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

  it("renders links to conversations", () => {
    renderComponent();
    const link = screen.getByText("Friend1").closest("a");
    expect(link).toHaveAttribute("href", "/applications/canteen/messages/2");
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