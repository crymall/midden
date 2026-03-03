import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserProfile from "../UserProfile";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

// Mock hooks
vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

// Mock child components to isolate UserProfile logic
vi.mock("../../../components/canteen/RecipeList", () => ({
  default: ({ recipes }) => <div data-testid="recipe-list">{recipes.length} Recipes</div>,
}));
vi.mock("../../../components/canteen/ListList", () => ({
  default: ({ userLists }) => <div data-testid="list-list">{userLists.length} Lists</div>,
}));
vi.mock("../../../components/canteen/PaginationControls", () => ({
  default: ({ onPageChange, page }) => (
    <button onClick={() => onPageChange(page + 1)}>Next Page</button>
  ),
}));

vi.mock("../../../components/MiddenModal", () => ({
  default: ({ isOpen, children, title }) => (
    isOpen ? <div data-testid="midden-modal"><h2>{title}</h2>{children}</div> : null
  ),
}));

describe("UserProfile", () => {
  const mockCanteenApi = {
    fetchUser: vi.fn(),
    createList: vi.fn(),
  };
  const mockGetUserProfileRecipes = vi.fn();
  const mockGetUserLists = vi.fn().mockResolvedValue([]);
  const mockGetFollowers = vi.fn();
  const mockGetFollowing = vi.fn();
  const mockFollowUser = vi.fn();
  const mockUnfollowUser = vi.fn();

  const defaultUser = { id: 1, username: "TestUser" };
  const viewedUser = { id: 2, username: "ViewedUser" };

  const defaultContext = {
    canteenApi: mockCanteenApi,
    getUserProfileRecipes: mockGetUserProfileRecipes,
    userProfileRecipes: [],
    getUserLists: mockGetUserLists,
    userLists: [],
    recipesLoading: false,
    followers: [],
    following: [],
    getFollowers: mockGetFollowers,
    getFollowing: mockGetFollowing,
    followUser: mockFollowUser,
    unfollowUser: mockUnfollowUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: defaultUser,
    });

    useData.mockReturnValue(defaultContext);

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

  it("renders loading state initially", async () => {
    renderComponent();
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument());
  });

  it("renders user profile data after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("ViewedUser")).toBeInTheDocument();
    });
    // Check for relationship data fetching
    expect(mockGetFollowers).toHaveBeenCalledWith("2");
    expect(mockGetFollowing).toHaveBeenCalledWith("2");

    expect(screen.getByText("ViewedUser's Recipes")).toBeInTheDocument();
  });

  it("handles user not found", async () => {
    mockCanteenApi.fetchUser.mockRejectedValue(new Error("Not found"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("User not found.")).toBeInTheDocument();
    });
  });

  it("fetches recipes for the user on mount", async () => {
    renderComponent();
    await waitFor(() => {
      expect(mockGetUserProfileRecipes).toHaveBeenCalledWith("2", 20, 0);
    });
  });

  it("switches tabs and fetches lists", async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    const listsTab = screen.getByText("ViewedUser's Lists");
    await act(async () => {
      fireEvent.click(listsTab);
    });

    expect(mockGetUserLists).toHaveBeenCalledWith("2", 20, 0);
    expect(screen.getByTestId("list-list")).toBeInTheDocument();
  });

  it("shows 'Manage My Lists' only for own profile", async () => {
    useAuth.mockReturnValue({ user: { id: 2, username: "ViewedUser" } }); // Same ID as viewed
    renderComponent("2");

    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("ViewedUser's Lists"));
    });

    expect(screen.getByText("Manage My Lists →")).toBeInTheDocument();
  });

  it("does not show 'Manage My Lists' for other profiles", async () => {
    useAuth.mockReturnValue({ user: { id: 1, username: "OtherUser" } });
    renderComponent("2");

    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("ViewedUser's Lists"));
    });

    expect(screen.queryByText("Manage My Lists →")).not.toBeInTheDocument();
  });

  it("renders create buttons for own profile", async () => {
    useAuth.mockReturnValue({ user: { id: 2, username: "ViewedUser" } });
    renderComponent("2");
    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    expect(screen.getByText("+ List")).toBeInTheDocument();
    expect(screen.getByText("+ Recipe")).toBeInTheDocument();
  });

  it("opens create list modal", async () => {
    useAuth.mockReturnValue({ user: { id: 2, username: "ViewedUser" } });
    renderComponent("2");
    await waitFor(() => expect(screen.getByText("ViewedUser")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText("+ List"));
    });
    expect(screen.getByTestId("midden-modal")).toBeInTheDocument();
  });

  describe("Relationships", () => {
    it("displays follower and following counts", async () => {
      useData.mockReturnValue({
        ...defaultContext,
        followers: [{ id: 3, username: "Follower1" }],
        following: [
          { id: 4, username: "Following1" },
          { id: 5, username: "Following2" },
        ],
      });

      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("ViewedUser")).toBeInTheDocument(),
      );

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText(/Followers/)).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText(/Following/)).toBeInTheDocument();
    });

    it("shows Follow button for other users", async () => {
      renderComponent("2");
      await waitFor(() =>
        expect(screen.getByText("ViewedUser")).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "Follow" }),
      ).toBeInTheDocument();
    });

    it("shows Unfollow button if already following", async () => {
      useData.mockReturnValue({
        ...defaultContext,
        followers: [{ id: 1, username: "TestUser" }], // Current user is a follower
      });

      renderComponent("2");
      await waitFor(() =>
        expect(screen.getByText("ViewedUser")).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "Unfollow" }),
      ).toBeInTheDocument();
    });

    it("calls followUser and refreshes followers on follow button click", async () => {
      renderComponent("2");
      await waitFor(() =>
        expect(screen.getByText("ViewedUser")).toBeInTheDocument(),
      );

      const followButton = screen.getByRole("button", { name: "Follow" });
      fireEvent.click(followButton);

      expect(mockFollowUser).toHaveBeenCalledWith("2");
      // It's called once on mount, and once after the toggle
      await waitFor(() => {
        expect(mockGetFollowers).toHaveBeenCalledTimes(2);
      });
    });

    it("calls unfollowUser and refreshes followers on unfollow button click", async () => {
      useData.mockReturnValue({
        ...defaultContext,
        followers: [{ id: 1, username: "TestUser" }], // Current user is a follower
      });
      renderComponent("2");
      await waitFor(() => screen.getByText("Unfollow"));
      fireEvent.click(screen.getByText("Unfollow"));
      expect(mockUnfollowUser).toHaveBeenCalledWith("2");
      await waitFor(() => {
        expect(mockGetFollowers).toHaveBeenCalledTimes(2);
      });
    });
  });
});