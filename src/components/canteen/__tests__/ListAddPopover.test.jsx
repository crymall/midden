import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ListAddPopover from "../ListAddPopover";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

// Mock dependencies
vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

// Mock Headless UI
vi.mock("@headlessui/react", async () => {
  const actual = await vi.importActual("@headlessui/react");
  return {
    ...actual,
    Popover: ({ children }) => (
      <div data-testid="popover">
        {typeof children === "function"
          ? children({ close: vi.fn() })
          : children}
      </div>
    ),
    PopoverButton: ({ children, onMouseEnter, ...props }) => (
      <button onMouseEnter={onMouseEnter} {...props}>
        {children}
      </button>
    ),
    PopoverPanel: ({ children }) => (
      <div data-testid="popover-panel">{children}</div>
    ),
    Dialog: ({ open, children }) =>
      open ? <div data-testid="dialog">{children}</div> : null,
    DialogPanel: ({ children }) => <div>{children}</div>,
    DialogTitle: ({ children }) => <h2>{children}</h2>,
    Field: ({ children }) => <div>{children}</div>,
    Label: ({ children }) => <label>{children}</label>,
    Input: (props) => <input {...props} />,
    Button: (props) => <button {...props} />,
    // Mock Combobox to allow triggering changes
    Combobox: ({ onChange, children }) => (
      <div data-testid="combobox">
        {children}
        {/* Helper buttons to simulate selection since rendering options inside mock is complex */}
        <button
          data-testid="mock-select-list"
          onClick={() => onChange({ id: "list1", name: "My List" })}
        >
          Select List
        </button>
        <button
          data-testid="mock-create-list-action"
          onClick={() => onChange({ action: "create" })}
        >
          Create Action
        </button>
      </div>
    ),
    ComboboxInput: ({ onChange, ...props }) => (
      <input data-testid="combobox-input" onChange={onChange} {...props} />
    ),
    ComboboxOptions: ({ children }) => <div>{children}</div>,
    ComboboxOption: ({ children }) => (
      <div role="option" data-testid="mock-combobox-option">
        {children}
      </div>
    ),
  };
});

describe("ListAddPopover", () => {
  const mockGetComboboxLists = vi.fn();
  const mockAddRecipeToList = vi.fn();
  const mockCreateList = vi.fn();
  const mockUpdateComboboxListTimestamp = vi.fn();
  const mockUser = { id: "user123" };

  const defaultContext = {
    comboboxLists: [],
    getComboboxLists: mockGetComboboxLists,
    updateComboboxListTimestamp: mockUpdateComboboxListTimestamp,
    canteenApi: {
      addRecipeToList: mockAddRecipeToList,
      createList: mockCreateList,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    useData.mockReturnValue(defaultContext);
    mockGetComboboxLists.mockResolvedValue([]);
  });

  it("renders the button with default label", () => {
    render(<ListAddPopover recipeId="123" />);
    expect(screen.getByText("+ Add")).toBeInTheDocument();
  });

  it("renders the button with custom label", () => {
    render(<ListAddPopover recipeId="123" label="Add to List" />);
    expect(screen.getByText("Add to List")).toBeInTheDocument();
  });

  it("fetches combobox lists from context on hover if empty", () => {
    render(<ListAddPopover recipeId="123" />);
    const btn = screen.getByText("+ Add");
    fireEvent.mouseEnter(btn);
    expect(mockGetComboboxLists).toHaveBeenCalledWith("user123");
  });

  it("searches lists on typing", () => {
    render(<ListAddPopover recipeId="123" />);
    const input = screen.getByTestId("combobox-input");
    fireEvent.change(input, { target: { value: "Dinner" } });
    expect(mockGetComboboxLists).toHaveBeenCalledWith("user123", "Dinner");
  });

  it("sorts lists by updated_at ascending for UI display", () => {
    const unsortedLists = [
      { id: "1", name: "Old", updated_at: "2023-01-01T10:00:00Z" },
      { id: "2", name: "New", updated_at: "2023-02-01T10:00:00Z" },
    ];
    useData.mockReturnValue({
      ...defaultContext,
      comboboxLists: unsortedLists,
    });

    render(<ListAddPopover recipeId="123" />);

    // Open popover to render options
    const btn = screen.getByText("+ Add");
    fireEvent.click(btn); // Clicking usually opens it in Headless UI

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("Old");
    expect(options[0]).toHaveTextContent("New");
  });

  it("adds recipe to an existing list", async () => {
    useData.mockReturnValue({
      ...defaultContext,
      comboboxLists: [{ id: "list1", name: "My List" }],
    });
    render(<ListAddPopover recipeId="123" />);

    fireEvent.click(screen.getByTestId("mock-select-list"));

    await waitFor(() => {
      expect(mockAddRecipeToList).toHaveBeenCalledWith("list1", "123");
      expect(mockUpdateComboboxListTimestamp).toHaveBeenCalledWith("list1");
    });

    expect(screen.getByText("Added!")).toBeInTheDocument();
  });

  it("opens create list dialog and creates new list", async () => {
    mockCreateList.mockResolvedValue({ id: "new-list-id", name: "New List" });

    render(<ListAddPopover recipeId="123" />);

    const input = screen.getByTestId("combobox-input");
    fireEvent.change(input, { target: { value: "New List" } });
    fireEvent.click(screen.getByTestId("mock-create-list-action"));

    expect(screen.getByText("Create New List")).toBeInTheDocument();

    // Input should be pre-filled with query
    const dialogInputs = screen.getAllByDisplayValue("New List");
    dialogInputs.forEach((el) => expect(el).toBeInTheDocument());

    fireEvent.click(screen.getByText("Create & Add"));

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith("New List");
      expect(mockGetComboboxLists).toHaveBeenCalledWith("user123", "New List");
      expect(mockAddRecipeToList).toHaveBeenCalledWith("new-list-id", "123");
    });
  });

  it("handles add to list failure", async () => {
    mockAddRecipeToList.mockRejectedValue(new Error("Failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ListAddPopover recipeId="123" />);

    fireEvent.click(screen.getByTestId("mock-select-list"));

    await waitFor(() => {
      expect(screen.getByText("Failed.")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("handles already in list error", async () => {
    const error = new Error("Conflict");
    error.response = { status: 409 };
    mockAddRecipeToList.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ListAddPopover recipeId="123" />);

    fireEvent.click(screen.getByTestId("mock-select-list"));

    await waitFor(() => {
      expect(screen.getByText("Already in list.")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("moves list to top after adding recipe", async () => {
    mockAddRecipeToList.mockResolvedValue({});

    const initialLists = [
      { id: "list1", name: "Old List", updated_at: "2023-01-01T00:00:00Z" },
      { id: "list2", name: "New List", updated_at: "2023-01-02T00:00:00Z" },
    ];

    let currentLists = [...initialLists];
    useData.mockImplementation(() => ({
      ...defaultContext,
      comboboxLists: currentLists,
      updateComboboxListTimestamp: vi.fn((listId) => {
        currentLists = currentLists.map((l) =>
          l.id === listId ? { ...l, updated_at: new Date().toISOString() } : l
        );
      }),
    }));

    render(<ListAddPopover recipeId="123" />);

    // Open popover
    fireEvent.click(screen.getByText("+ Add"));

    // Add to Old List (list1) - mock button adds to 'list1'
    fireEvent.click(screen.getByTestId("mock-select-list"));

    await waitFor(() => {
      expect(screen.getByText("Added!")).toBeInTheDocument();
    });

    // Check new order: Old List (list1) should now be first because its updated_at was bumped
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Old List");
    expect(options[1]).toHaveTextContent("New List");
  });
});
