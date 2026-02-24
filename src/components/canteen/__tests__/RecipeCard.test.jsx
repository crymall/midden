import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RecipeCard from '../RecipeCard';
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");
vi.mock("../../gateways/Can", () => ({
  default: ({ children }) => <div data-testid="can-gate">{children}</div>,
}));

vi.mock("../ListAddPopover", () => ({
  default: ({ recipeId }) => (
    <button data-testid="list-add-popover" data-recipe-id={recipeId}>
      + Add
    </button>
  ),
}));

describe("RecipeCard", () => {
  const mockUser = { id: "user123" };

  const defaultContext = {
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

  it("renders the add to list popover", () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} />
      </MemoryRouter>
    );
    const popover = screen.getByTestId("list-add-popover");
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute("data-recipe-id", "123");
  });
});