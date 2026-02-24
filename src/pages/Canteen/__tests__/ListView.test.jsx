import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ListView from "../ListView";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

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
      {loading ? "Loading Recipes..." : `Recipes: ${recipes?.length || 0}`}
    </div>
  ),
}));

describe("ListView", () => {
  const mockGetUserLists = vi.fn();
  const mockGetListRecipes = vi.fn();
  const mockUser = { id: "user123" };

  const defaultContext = {
    userLists: [],
    recipesLoading: false,
    getUserLists: mockGetUserLists,
    getListRecipes: mockGetListRecipes,
    currentListRecipes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    useData.mockReturnValue(defaultContext);
  });

  const renderWithRouter = (listId = "1") => {
    render(
      <MemoryRouter initialEntries={[`/lists/${listId}`]}>
        <Routes>
          <Route path="/lists/:id" element={<ListView />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("fetches list recipes on mount", () => {
    useData.mockReturnValue({
      ...defaultContext,
      userLists: [{ id: "1", name: "My List" }],
    });

    renderWithRouter("1");

    expect(mockGetListRecipes).toHaveBeenCalledWith("1");
    expect(screen.getByText("My List")).toBeInTheDocument();
  });

  it("fetches user lists if current list is not found in context", () => {
    renderWithRouter("1");

    expect(mockGetUserLists).toHaveBeenCalledWith("user123");
    expect(mockGetListRecipes).toHaveBeenCalledWith("1");
  });

  it("shows loading state when recipes are loading", () => {
    useData.mockReturnValue({
      ...defaultContext,
      userLists: [{ id: "1", name: "My List" }],
      recipesLoading: true,
    });

    renderWithRouter("1");

    expect(screen.getByText("Loading Recipes...")).toBeInTheDocument();
  });

  it("renders list name and recipes when loaded", () => {
    const mockRecipes = [{ id: 101, title: "Pasta" }, { id: 102, title: "Soup" }];
    useData.mockReturnValue({
      ...defaultContext,
      userLists: [{ id: "1", name: "Dinner Ideas" }],
      currentListRecipes: mockRecipes,
    });

    renderWithRouter("1");

    expect(screen.getByText("Dinner Ideas")).toBeInTheDocument();
    expect(screen.getByText("Recipes: 2")).toBeInTheDocument();
  });

  it("handles list not found state correctly", () => {
    useData.mockReturnValue({
      ...defaultContext,
      userLists: [{ id: "2", name: "Other List" }], // List 1 missing
      recipesLoading: false,
    });

    renderWithRouter("1");

    expect(screen.getByText("List Not Found")).toBeInTheDocument();
    expect(screen.getByText("The requested list could not be found.")).toBeInTheDocument();
  });

  it("shows 'Loading List...' title if list is missing but recipes are loading", () => {
    useData.mockReturnValue({
      ...defaultContext,
      userLists: [], 
      recipesLoading: true,
    });

    renderWithRouter("1");
    
    expect(screen.getByText("Loading List...")).toBeInTheDocument();
  });
});