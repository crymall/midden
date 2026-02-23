import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RecipeCard from '../RecipeCard';
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

// Mock dependencies
vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");
vi.mock("../../gateways/Can", () => ({
  default: ({ children }) => <div data-testid="can-gate">{children}</div>,
}));

// Mock Headless UI
vi.mock("@headlessui/react", async () => {
  const actual = await vi.importActual("@headlessui/react");
  return {
    ...actual,
    Popover: ({ children }) => <div data-testid="popover">{typeof children === 'function' ? children({ close: vi.fn() }) : children}</div>,
    PopoverButton: ({ children, onMouseEnter, ...props }) => (
      <button onMouseEnter={onMouseEnter} {...props}>{children}</button>
    ),
    PopoverPanel: ({ children }) => <div data-testid="popover-panel">{children}</div>,
    Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
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
        <button 
          data-testid="mock-select-list" 
          onClick={() => onChange({ id: 'list1', name: 'My List' })}
        >
          Select List
        </button>
        <button 
          data-testid="mock-create-list-action" 
          onClick={() => onChange({ action: 'create' })}
        >
          Create Action
        </button>
      </div>
    ),
    ComboboxInput: ({ onChange, ...props }) => (
      <input 
        data-testid="combobox-input" 
        onChange={onChange} 
        {...props} 
      />
    ),
    ComboboxOptions: ({ children }) => <div>{children}</div>,
    ComboboxOption: ({ children }) => <div>{children}</div>,
  };
});

describe("RecipeCard", () => {
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

  const mockRecipe = {
    id: "123",
    title: "Spicy Tacos",
    description: "Delicious tacos with spicy salsa.",
    likes: ["user1", "user2", "user3"],
    tags: [
      { id: "1", name: "Mexican" },
      { id: "2", name: "Spicy" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    useData.mockReturnValue(defaultContext);
  });

  it("renders the recipe title", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    expect(screen.getByText("Spicy Tacos")).toBeInTheDocument();
  });

  it("renders the recipe description", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    expect(screen.getByText("Delicious tacos with spicy salsa.")).toBeInTheDocument();
  });

  it("truncates the description at the last complete word within 150 characters", () => {
    // "word " is 5 chars. 29 * 5 = 145 chars.
    // "cutoff" is 6 chars. Total 151 chars.
    const longDescription = "word ".repeat(29) + "cutoff";
    const recipeWithLongDesc = { ...mockRecipe, description: longDescription };
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipeWithLongDesc} />
      </MemoryRouter>
    );
    const expected = "word ".repeat(29).trim() + "...";
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("renders the like count when likes exist", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    expect(screen.getByText("♥ 3")).toBeInTheDocument();
  });

  it("does not render the like count when likes are empty", () => {
    const recipeNoLikes = { ...mockRecipe, likes: [] };
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipeNoLikes} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/♥/)).not.toBeInTheDocument();
  });

  it("renders tags correctly", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    expect(screen.getByText("Mexican")).toBeInTheDocument();
    expect(screen.getByText("Spicy")).toBeInTheDocument();
  });

  it("links to the correct recipe detail page", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/applications/canteen/recipes/123");
  });

  it("fetches combobox lists on hover of add button", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    
    const addBtn = screen.getByText("+ Add");
    fireEvent.mouseEnter(addBtn);
    
    expect(mockGetComboboxLists).toHaveBeenCalledWith("user123");
  });

  it("adds recipe to an existing list", async () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );

    // Trigger selection via mock button
    fireEvent.click(screen.getByTestId("mock-select-list"));

    await waitFor(() => {
      expect(mockAddRecipeToList).toHaveBeenCalledWith("list1", "123");
    });

    expect(screen.getByText("Added!")).toBeInTheDocument();
  });

  it("opens create list dialog and creates new list", async () => {
    mockCreateList.mockResolvedValue({ id: "new-list-id", name: "New List" });

    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );

    // Simulate typing in combobox to set query
    const input = screen.getByTestId("combobox-input");
    fireEvent.change(input, { target: { value: "New List" } });

    // Trigger create action via mock button
    fireEvent.click(screen.getByTestId("mock-create-list-action"));

    // Dialog should open
    expect(screen.getByText("Create New List")).toBeInTheDocument();
    
    // Input should be pre-filled with query
    const dialogInput = screen.getAllByDisplayValue("New List");
    dialogInput.forEach(el => expect(el).toBeInTheDocument());

    // Click Create & Add
    fireEvent.click(screen.getByText("Create & Add"));

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith("New List");
      expect(mockGetComboboxLists).toHaveBeenCalledWith("user123", "New List");
      expect(mockAddRecipeToList).toHaveBeenCalledWith("new-list-id", "123");
    });
  });
});