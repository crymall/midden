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

// Mock PaginationControls to isolate RecipeSearch logic
vi.mock("../../../components/PaginationControls", () => ({
  default: ({ page, limit, onPageChange, onLimitChange, loading, isNextDisabled }) => (
    <div data-testid="pagination-controls">
      <span data-testid="page-val">{page}</span>
      <span data-testid="limit-val">{limit}</span>
      <span data-testid="loading-val">{String(loading)}</span>
      <span data-testid="next-disabled-val">{String(isNextDisabled)}</span>
      <button onClick={() => onPageChange(page - 1)}>Prev</button>
      <button onClick={() => onPageChange(page + 1)}>Next</button>
      <input 
        data-testid="limit-input"
        value={limit} 
        onChange={onLimitChange} 
      />
    </div>
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
    expect(screen.getByTestId("page-val")).toHaveTextContent("1");

    // Click Next
    fireEvent.click(screen.getByText("Next"));
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 20, {});
    expect(screen.getByTestId("page-val")).toHaveTextContent("2");

    // Click Prev
    fireEvent.click(screen.getByText("Prev"));
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 0, {});
    expect(screen.getByTestId("page-val")).toHaveTextContent("1");
  });

  it("handles limit change", () => {
    render(<RecipeSearch />);

    const input = screen.getByTestId("limit-input");
    fireEvent.change(input, { target: { value: "50" } });
    expect(mockGetRecipes).toHaveBeenCalledWith(50, 0, {});
  });

  it("handles filter application", () => {
    render(<RecipeSearch />);

    const filterBtn = screen.getByTestId("filter-btn");
    fireEvent.click(filterBtn);

    // Should reset to page 1 and fetch with new filters
    expect(mockGetRecipes).toHaveBeenCalledWith(20, 0, { title: "Test Filter" });
  });

  it("passes correct disabled state to pagination controls", () => {
    useData.mockReturnValue({
      recipes: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })), // 10 < 20
      recipesLoading: false,
      getRecipes: mockGetRecipes,
    });

    render(<RecipeSearch />);
    expect(screen.getByTestId("next-disabled-val")).toHaveTextContent("true");
  });

  it("passes correct loading state to pagination controls", () => {
    useData.mockReturnValue({
      recipes: [],
      recipesLoading: true,
      getRecipes: mockGetRecipes,
    });

    render(<RecipeSearch />);
    expect(screen.getByTestId("loading-val")).toHaveTextContent("true");
  });
});