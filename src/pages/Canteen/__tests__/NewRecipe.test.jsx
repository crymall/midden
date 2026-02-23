import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewRecipe from "../NewRecipe";
import useData from "../../../context/data/useData";

// eslint-disable-next-line no-undef
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../context/data/useData");

vi.mock("../../../components/MiddenCard", () => ({
  default: ({ title, children }) => (
    <div data-testid="midden-card">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@headlessui/react", async () => {
  const actual = await vi.importActual("@headlessui/react");
  return {
    ...actual,
    Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
    DialogPanel: ({ children }) => <div>{children}</div>,
    DialogTitle: ({ children }) => <h2>{children}</h2>,
  };
});

describe("NewRecipe", () => {
  const mockCreateRecipe = vi.fn();
  const mockGetTags = vi.fn();
  const mockCreateTag = vi.fn();
  const mockGetIngredients = vi.fn();
  const mockCreateIngredient = vi.fn();

  const defaultContext = {
    tags: [
      { id: "tag1", name: "Vegan" },
      { id: "tag2", name: "Spicy" },
    ],
    getTags: mockGetTags,
    createRecipe: mockCreateRecipe,
    createTag: mockCreateTag,
    createIngredient: mockCreateIngredient,
    getIngredients: mockGetIngredients,
    ingredients: [], // searchResults
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue(defaultContext);
  });

  it("renders the form correctly", () => {
    render(<NewRecipe />);
    
    expect(screen.getByText("New Recipe")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prep Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cook Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instructions/i)).toBeInTheDocument();
    
    // Initial ingredient row
    expect(screen.getByPlaceholderText("Qty")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Unit")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Notes")).toBeInTheDocument();
  });

  it("fetches tags and ingredients on mount", () => {
    render(<NewRecipe />);
    expect(mockGetTags).toHaveBeenCalled();
    expect(mockGetIngredients).toHaveBeenCalledWith(50);
  });

  it("handles input changes", () => {
    render(<NewRecipe />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "My New Recipe" } });
    expect(titleInput).toHaveValue("My New Recipe");

    const prepInput = screen.getByLabelText(/Prep Time/i);
    fireEvent.change(prepInput, { target: { value: "15" } });
    expect(prepInput).toHaveValue(15);
  });

  it("manages ingredients list (add/remove)", () => {
    render(<NewRecipe />);
    
    // Initial state: 1 ingredient row
    const getQtyInputs = () => screen.getAllByPlaceholderText("Qty");
    expect(getQtyInputs()).toHaveLength(1);

    // Add ingredient
    fireEvent.click(screen.getByText("+ Add Ingredient"));
    expect(getQtyInputs()).toHaveLength(2);

    // Remove ingredient (first one)
    const removeBtns = screen.getAllByText("✕");
    fireEvent.click(removeBtns[0]);
    expect(getQtyInputs()).toHaveLength(1);
  });

  it("handles tag selection", () => {
    render(<NewRecipe />);
    
    // Open Popover
    const trigger = screen.getByText("Select tags...");
    fireEvent.click(trigger);

    // Check "Vegan"
    const veganCheckbox = screen.getByLabelText("Vegan");
    fireEvent.click(veganCheckbox);
    
    expect(screen.getByText("1 tag selected")).toBeInTheDocument();
  });

  it("creates a new tag", async () => {
    mockCreateTag.mockResolvedValue({ id: "tag3", name: "Gluten-Free" });
    render(<NewRecipe />);

    // Open Popover
    fireEvent.click(screen.getByText("Select tags..."));
    
    // Click Create new tag
    fireEvent.click(screen.getByText("+ Create new tag"));
    
    // Modal should be open
    expect(screen.getByText("Create New Tag")).toBeInTheDocument();
    
    // Fill input
    const input = screen.getByPlaceholderText("Tag Name");
    fireEvent.change(input, { target: { value: "Gluten-Free" } });
    
    // Confirm
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith("Gluten-Free");
    });
    
    // Modal closed
    expect(screen.queryByText("Create New Tag")).not.toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    mockCreateRecipe.mockResolvedValue({ data: { id: "101" } });
    render(<NewRecipe />);

    // Fill basic info
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Soup" } });
    fireEvent.change(screen.getByLabelText(/Prep Time/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/Cook Time/i), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText(/Servings/i), { target: { value: "4" } });
    
    // Fill ingredient
    const ingNameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(ingNameInput, { target: { value: "Water" } });
    
    // Submit
    fireEvent.click(screen.getByText("Create Recipe"));

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith(expect.objectContaining({
        title: "Soup",
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        servings: 4,
        ingredients: expect.arrayContaining([
          expect.objectContaining({ name: "Water" })
        ])
      }));
    });

    expect(mockNavigate).toHaveBeenCalledWith("/applications/canteen/recipes/101");
  });

  it("handles submission error", async () => {
    mockCreateRecipe.mockRejectedValue(new Error("Failed"));
    render(<NewRecipe />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Soup" } });
    fireEvent.click(screen.getByText("Create Recipe"));

    await waitFor(() => {
      expect(screen.getByText(/Failed to create recipe/i)).toBeInTheDocument();
    });
  });

  it("opens create ingredient modal when selecting create option", async () => {
    mockCreateIngredient.mockResolvedValue({ id: "ing99", name: "NewSpice" });
    render(<NewRecipe />);

    const input = screen.getByPlaceholderText("Name");
    fireEvent.change(input, { target: { value: "NewSpice" } });
    
    // Wait for the option to appear
    await screen.findByText('Create "NewSpice"');
    
    // Select via Enter key
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Modal opens
    expect(await screen.findByText("Create Ingredient")).toBeInTheDocument();
    expect(screen.getByText('"NewSpice"')).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockCreateIngredient).toHaveBeenCalledWith("NewSpice");
    });

    // Modal closes
    expect(screen.queryByText("Create Ingredient")).not.toBeInTheDocument();
  });
});