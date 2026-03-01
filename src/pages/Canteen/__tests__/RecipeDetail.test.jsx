import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecipeDetail from "../RecipeDetail";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "123" }),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

vi.mock("../../../components/MiddenCard", () => ({
  default: ({ children }) => <div data-testid="midden-card">{children}</div>,
}));

vi.mock("../../../components/gateways/Can", () => ({
  default: ({ children }) => <div data-testid="can-gate">{children}</div>,
}));

vi.mock("../../../components/canteen/ListAddPopover", () => ({
  default: ({ recipeId, label }) => (
    <button data-testid="list-add-popover" data-recipe-id={recipeId}>
      {label}
    </button>
  ),
}));

vi.mock("@headlessui/react", async () => {
  const actual = await vi.importActual("@headlessui/react");
  return {
    ...actual,
    Dialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
    DialogPanel: ({ children }) => <div>{children}</div>,
  };
});

describe("RecipeDetail", () => {
  const mockGetRecipe = vi.fn();
  const mockToggleRecipeLike = vi.fn();

  const mockRecipe = {
    id: "123",
    title: "Test Recipe",
    author: { id: "u1", username: "chef_test" },
    description: "A tasty test recipe",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    wait_time_minutes: 30,
    total_time_minutes: 60,
    servings: 4,
    ingredients: [
      { quantity: "1", unit: "cup", name: "Flour", notes: "sifted" },
    ],
    instructions: "Mix and bake.",
    likes: [],
    tags: [{ id: "1", name: "TestTag" }],
  };

  const mockUser = { id: "user1", username: "testuser" };

  const defaultContext = {
    currentRecipe: mockRecipe,
    recipesLoading: false,
    getRecipe: mockGetRecipe,
    toggleRecipeLike: mockToggleRecipeLike,
    getUserLists: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useData.mockReturnValue(defaultContext);
    useAuth.mockReturnValue({ user: mockUser });
  });

  it("fetches recipe on mount", () => {
    render(<RecipeDetail />);
    expect(mockGetRecipe).toHaveBeenCalledWith("123");
  });

  it("renders loading state", () => {
    useData.mockReturnValue({ ...defaultContext, recipesLoading: true });
    render(<RecipeDetail />);
    expect(screen.getByText(/Loading recipe.../i)).toBeInTheDocument();
  });

  it("renders not found state", () => {
    useData.mockReturnValue({ ...defaultContext, currentRecipe: null });
    render(<RecipeDetail />);
    expect(screen.getByText(/Recipe not found/i)).toBeInTheDocument();
  });

  it("renders recipe details correctly", () => {
    render(<RecipeDetail />);
    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    expect(screen.getByText("chef_test")).toBeInTheDocument();
    expect(screen.getByText("A tasty test recipe")).toBeInTheDocument();
    expect(screen.getByText("10m")).toBeInTheDocument(); // Prep
    expect(screen.getByText("20m")).toBeInTheDocument(); // Cook
    expect(screen.getByText("60m")).toBeInTheDocument(); // Total
    expect(screen.getByText("4")).toBeInTheDocument(); // Servings
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Mix and bake.")).toBeInTheDocument();
    expect(screen.getByText("TestTag")).toBeInTheDocument();
  });

  it("renders author link correctly", () => {
    render(<RecipeDetail />);
    const authorLink = screen.getByText("chef_test").closest("a");
    expect(authorLink).toHaveAttribute("href", "/applications/canteen/user/u1");
  });

  it("handles like toggle", () => {
    render(<RecipeDetail />);
    const likeBtn = screen.getByText("♡ Like");
    fireEvent.click(likeBtn);
    expect(mockToggleRecipeLike).toHaveBeenCalledWith("123", false);
  });

  it("shows liked state correctly", () => {
    const likedRecipe = {
      ...mockRecipe,
      likes: [{ user_id: "user1" }],
    };
    useData.mockReturnValue({
      ...defaultContext,
      currentRecipe: likedRecipe,
    });

    render(<RecipeDetail />);
    expect(screen.getByText("♥ Liked")).toBeInTheDocument();
  });

  it("renders add to list popover", () => {
    render(<RecipeDetail />);
    const popover = screen.getByTestId("list-add-popover");
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute("data-recipe-id", "123");
    expect(popover).toHaveTextContent("+ Add to List");
  });
});