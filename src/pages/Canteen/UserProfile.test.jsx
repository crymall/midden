import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserProfile from "./UserProfile";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";

// Mock hooks
vi.mock("../../context/data/useData");
vi.mock("../../context/auth/useAuth");

// Mock child components to isolate UserProfile logic
vi.mock("../../components/canteen/RecipeList", () => ({
  default: ({ recipes }) => <div data-testid="recipe-list">{recipes.length} Recipes</div>,
}));
vi.mock("../../components/canteen/ListList", () => ({
  default: ({ userLists }) => <div data-testid="list-list">{userLists.length} Lists</div>,
}));
vi.mock("../../components/PaginationControls", () => ({
  default: ({ onPageChange, page }) => (
    <button onClick={() => onPageChange(page + 1)}>Next Page</button>
  ),
}));

describe("UserProfile", () => {
  const mockCanteenApi = {
    fetchUser: vi.fn(),
  };
  const mockGetUserProfileRecipes = vi.fn();
  const mockGetUserLists = vi.fn().mockResolvedValue([]);

  const defaultUser = { id: 1, username: "TestUser" };
  const viewedUser = { id: 2, username: "ViewedUser" };

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: defaultUser,
    });

    useData.mockReturnValue({
      canteenApi: mockCanteenApi,
      getUserProfileRecipes: mockGetUserProfileRecipes,
      userProfileRecipes: [],
      getUserLists: mockGetUserLists,
      userLists: [],
      recipesLoading: false,
    });

    mockCanteenApi.fetchUser.mockResolvedValue(viewedUser);
  });

  const renderComponent = (userId = "2") => {
    return render(
      <MemoryRouter initialEntries={[`/user/${userId}`]}>
        <Routes>
          <Route path="/user/:id" element={<UserProfile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders loading state initially", () => {
    renderComponent();
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("renders user profile data after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("ViewedUser")).toBeInTheDocument();
    });
    expect(screen.getByText("ViewedUser's Recipes")).toBeInTheDocument();
  });

  it("handles user not found", async () => {
    mockCanteenApi.fetchUser.mockRejectedValue(new Error("Not found"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("User not found.")).toBeInTheDocument();
    });
  });

  it("fetches recipes on mount", async () => {
    renderComponent();
    await waitFor(() => {
      expect(mockGetUserProfileRecipes).toHaveBeenCalledWith("2", 20, 0);
    });
  });

  it("switches tabs and fetches lists", async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    const listsTab = screen.getByText("ViewedUser's Lists");
    fireEvent.click(listsTab);

    expect(mockGetUserLists).toHaveBeenCalledWith("2", 20, 0);
    expect(screen.getByTestId("list-list")).toBeInTheDocument();
  });

  it("shows 'Manage My Lists' only for own profile", async () => {
    useAuth.mockReturnValue({ user: { id: 2, username: "ViewedUser" } }); // Same ID as viewed
    renderComponent("2");

    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    fireEvent.click(screen.getByText("ViewedUser's Lists"));

    expect(screen.getByText("Manage My Lists →")).toBeInTheDocument();
  });

  it("does not show 'Manage My Lists' for other profiles", async () => {
    useAuth.mockReturnValue({ user: { id: 1, username: "OtherUser" } });
    renderComponent("2");

    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    fireEvent.click(screen.getByText("ViewedUser's Lists"));

    expect(screen.queryByText("Manage My Lists →")).not.toBeInTheDocument();
  });
});