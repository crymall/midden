import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecipeSearch from "../RecipeSearch";
import useData from "../../../context/data/useData";

vi.mock("../../../context/data/useData");

vi.mock("../../../components/MiddenCard", () => ({
  default: ({ children }) => (
    <div data-testid="midden-card">
      {children}
    </div>
  ),
}));

vi.mock("../../../components/canteen/RecipeList", () => ({
  default: ({ recipes, loading }) => (
    <div data-testid="recipe-list">
      {loading ? "Loading..." : `Recipes: ${recipes?.length || 0}`}
    </div>
  ),
}));

vi.mock("../../../components/canteen/RecipeFilter", () => ({
  default: ({ onFilter }) => (
    <button
      data-testid="filter-btn"
      onClick={() => onFilter({ title: "Test Filter" })}
    >
      Apply Filter
    </button>
  ),
}));

describe("RecipeSearch", () => {
  const mockGetRecipes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue({
      recipes: [],
      recipesLoading: false,
      getRecipes: mockGetRecipes,
    });
  });

  it("fetches recipes on mount if cache is empty", () => {
    render(<RecipeSearch />);
    // Initial fetch: limit 20, offset 0, empty filters
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 0, {});
  });

  it("does not fetch recipes on mount if cache exists", () => {
    useData.mockReturnValue({
      recipes: [{ id: 1, title: "Cached Recipe" }],
      recipesLoading: false,
      getRecipes: mockGetRecipes,
    });

    render(<RecipeSearch />);
    expect(mockGetRecipes).not.toHaveBeenCalled();
  });

  it("handles pagination interactions", () => {
    // Mock enough recipes to enable Next button (>= limit)
    useData.mockReturnValue({
      recipes: Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })),
      recipesLoading: false,
      getRecipes: mockGetRecipes,
    });

    render(<RecipeSearch />);

    // Check initial state
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    const nextBtn = screen.getByText("Next →");
    const prevBtn = screen.getByText("← Prev");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Click Next
    fireEvent.click(nextBtn);
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 20, {});
    expect(screen.getByText("Page 2")).toBeInTheDocument();

    // Click Prev
    fireEvent.click(prevBtn);
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 0, {});
    expect(screen.getByText("Page 1")).toBeInTheDocument();
  });

  it("handles limit change", () => {
    render(<RecipeSearch />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "50" } });

    // Should reset to page 1 and fetch with new limit
    expect(mockGetRecipes).toHaveBeenCalledWith(50, 0, {});
  });

  it("handles filter application", () => {
    render(<RecipeSearch />);

    const filterBtn = screen.getByTestId("filter-btn");
    fireEvent.click(filterBtn);

    // Should reset to page 1 and fetch with new filters
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 0, { title: "Test Filter" });
  });

  it("disables Next button when fewer recipes than limit are returned", () => {
    useData.mockReturnValue({
      recipes: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })), // 10 < 20
      recipesLoading: false,
      getRecipes: mockGetRecipes,
    });

    render(<RecipeSearch />);
    const nextBtn = screen.getByText("Next →");
    expect(nextBtn).toBeDisabled();
  });

  it("disables pagination buttons while loading", () => {
    useData.mockReturnValue({
      recipes: [],
      recipesLoading: true,
      getRecipes: mockGetRecipes,
    });

    render(<RecipeSearch />);
    const nextBtn = screen.getByText("Next →");
    const prevBtn = screen.getByText("← Prev");

    expect(nextBtn).toBeDisabled();
    expect(prevBtn).toBeDisabled();
  });
});