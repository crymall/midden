import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NewRecipe from "../NewRecipe";
import useData from "../../../context/data/useData";

vi.mock("../../../context/data/useData");
vi.mock("../../../components/canteen/DurationInput", () => ({
  default: ({ label, onChange }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// eslint-disable-next-line no-undef
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("NewRecipe", () => {
  const mockCreateTag = vi.fn();
  const mockCreateIngredient = vi.fn();
  const mockGetTags = vi.fn();
  const mockGetIngredients = vi.fn();
  const mockCreateRecipe = vi.fn();

  const defaultTags = [{ id: "t1", name: "Vegan" }];
  const defaultIngredients = [{ id: "i1", name: "Salt" }];

  const baseData = {
    tags: defaultTags,
    getTags: mockGetTags,
    ingredients: defaultIngredients, // search results
    getIngredients: mockGetIngredients,
    createTag: mockCreateTag,
    createIngredient: mockCreateIngredient,
    createRecipe: mockCreateRecipe,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue(baseData);
  });

  it("opens create tag modal and creates tag", async () => {
    mockCreateTag.mockResolvedValue({ id: "t2", name: "New Tag" });

    render(
      <MemoryRouter>
        <NewRecipe />
      </MemoryRouter>
    );

    // Open tags popover
    const tagsButton = screen.getByText(/Select tags.../);
    fireEvent.click(tagsButton);

    // Click create new tag button inside popover
    const createBtn = screen.getByText("+ Create new tag");
    fireEvent.click(createBtn);

    // Check modal
    expect(screen.getByText("Create New Tag")).toBeInTheDocument();

    // Fill input
    const input = screen.getByPlaceholderText("Tag Name");
    fireEvent.change(input, { target: { value: "New Tag" } });

    // Confirm
    const confirmBtn = screen.getByText("Create");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith("New Tag");
    });
  });

  it("opens create ingredient modal and creates ingredient", async () => {
    useData.mockReturnValue({
      ...baseData,
      ingredients: [],
    });

    mockCreateIngredient.mockResolvedValue({ id: "i2", name: "New Ing" });

    render(
      <MemoryRouter>
        <NewRecipe />
      </MemoryRouter>
    );

    // Find ingredient combobox input
    const input = screen.getByPlaceholderText("Name");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "New Ing" } });

    // Wait for the "Create" option to appear in combobox
    await screen.findByText('Create "New Ing"');
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Check modal
    expect(screen.getByText("Create Ingredient")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to create the ingredient/)).toBeInTheDocument();
    expect(screen.getByText('"New Ing"')).toBeInTheDocument();

    // Confirm
    const confirmBtn = screen.getByText("Create");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockCreateIngredient).toHaveBeenCalledWith("New Ing");
      // Should refresh ingredients list
      expect(mockGetIngredients).toHaveBeenCalled();
    });
  });

  it("submits form with all fields including wait time", async () => {
    mockCreateRecipe.mockResolvedValue({ id: "123" });

    render(
      <MemoryRouter>
        <NewRecipe />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Recipe" } });
    fireEvent.change(screen.getByLabelText("Prep Time"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Cook Time"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Wait Time"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("Servings"), { target: { value: "4" } });

    const submitBtn = screen.getByText("Create Recipe");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith(expect.objectContaining({
        title: "My Recipe",
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        wait_time_minutes: 30,
        servings: 4,
      }));
    });

    // Should navigate to new recipe
    expect(mockNavigate).toHaveBeenCalledWith("/applications/canteen/recipes/123");
  });
});