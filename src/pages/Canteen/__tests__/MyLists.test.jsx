import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyLists from "../MyLists";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

// Mock dependencies
vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

// Mock UI components
vi.mock("../../../components/MiddenCard", () => ({
  default: ({ title, children }) => (
    <div data-testid="midden-card">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock Headless UI Dialog to avoid portal issues
vi.mock("@headlessui/react", async () => {
  const actual = await vi.importActual("@headlessui/react");
  return {
    ...actual,
    Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
    DialogPanel: ({ children }) => <div>{children}</div>,
  };
});

describe("MyLists", () => {
  const mockGetUserLists = vi.fn();
  const mockCreateList = vi.fn();
  const mockUser = { id: "user123" };

  const defaultContext = {
    userLists: [],
    getUserLists: mockGetUserLists,
    canteenApi: {
      createList: mockCreateList,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    useData.mockReturnValue(defaultContext);
    mockGetUserLists.mockResolvedValue([]);
  });

  it("fetches lists on mount and shows loading state", async () => {
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    // Initial loading state
    expect(screen.getByText("Loading lists...")).toBeInTheDocument();
    expect(mockGetUserLists).toHaveBeenCalledWith("user123", 20, 0);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading lists...")).not.toBeInTheDocument();
    });
  });

  it("renders empty state when no lists exist", async () => {
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You haven't created any lists yet.")).toBeInTheDocument();
    });
  });

  it("renders user lists when they exist", async () => {
    const mockLists = [
      { id: "1", name: "Weekly Dinner" },
      { id: "2", name: "Party Food" },
    ];
    useData.mockReturnValue({
      ...defaultContext,
      userLists: mockLists,
    });

    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Weekly Dinner")).toBeInTheDocument();
      expect(screen.getByText("Party Food")).toBeInTheDocument();
    });
  });

  it("opens and closes the create list modal", async () => {
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading lists...")).not.toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText("+ Create New List"));
    expect(screen.getByText("Create New List", { selector: "h3" })).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Create New List", { selector: "h3" })).not.toBeInTheDocument();
  });

  it("creates a new list successfully", async () => {
    mockCreateList.mockResolvedValue({ id: "3", name: "New List" });
    
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading lists...")).not.toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText("+ Create New List"));

    // Fill input
    const input = screen.getByLabelText("List Name");
    fireEvent.change(input, { target: { value: "New List" } });

    // Submit
    fireEvent.click(screen.getByText("Create List"));

    // Check loading state on button
    expect(screen.getByText("Creating...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith("New List");
      // Should refresh lists
      expect(mockGetUserLists).toHaveBeenCalledTimes(2); 
    });

    // Modal should close
    expect(screen.queryByText("Create New List", { selector: "h3" })).not.toBeInTheDocument();
  });

  it("handles creation error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateList.mockRejectedValue(new Error("Failed"));

    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading lists...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("+ Create New List"));
    fireEvent.change(screen.getByLabelText("List Name"), { target: { value: "Fail List" } });
    fireEvent.click(screen.getByText("Create List"));

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalled();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to create list", expect.any(Error));
    
    // Button should revert from "Creating..."
    expect(screen.getByText("Create List")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("handles pagination interactions", async () => {
    useData.mockReturnValue({
      ...defaultContext,
      userLists: Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1), name: "List" })),
    });

    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    // Wait for initial fetch to complete so button is enabled
    await waitFor(() => {
      expect(screen.queryByText("Loading lists...")).not.toBeInTheDocument();
    });

    const nextBtn = screen.getByText("Next →");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockGetUserLists).toHaveBeenCalledWith("user123", 20, 20);
    });
    
    expect(screen.getByText("Page 2")).toBeInTheDocument();
  });

  it("hoists 'Favorites' list to the top", async () => {
    const mockLists = [
      { id: "1", name: "Weekly Dinner" },
      { id: "2", name: "Favorites" },
      { id: "3", name: "Party Food" },
    ];
    useData.mockReturnValue({
      ...defaultContext,
      userLists: mockLists,
    });

    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      const listHeaders = screen.getAllByRole("heading", { level: 3 });
      expect(listHeaders[0]).toHaveTextContent("Favorites");
      expect(listHeaders[1]).toHaveTextContent("Weekly Dinner");
      expect(listHeaders[2]).toHaveTextContent("Party Food");
    });
  });
});