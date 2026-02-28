import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContext } from "react";
import { DataProvider } from "../DataProvider";
import DataContext from "../DataContext";
import * as iamApi from "../../../services/iamApi";
import * as canteenApi from "../../../services/canteenApi";

// Mock the dependencies
vi.mock("../../../services/iamApi");
vi.mock("../../../services/canteenApi");
vi.mock("../../../utils/constants", () => ({
  ROLES: {
    ADMIN: "role_admin_id",
    USER: "role_user_id",
  },
}));

describe("DataProvider", () => {
  const mockUsers = [
    { id: "1", name: "User One", role: "USER" },
    { id: "2", name: "User Two", role: "USER" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides initial state", () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    expect(result.current.usersLoading).toBe(false);
    expect(result.current.users).toEqual([]);
  });

  it("fetches users and updates state", async () => {
    iamApi.fetchUsers.mockResolvedValue({ users: mockUsers });
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    let promise;
    act(() => {
      promise = result.current.fetchUsers();
    });

    expect(result.current.usersLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.usersLoading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
    expect(iamApi.fetchUsers).toHaveBeenCalledTimes(1);
  });

  it("handles fetch error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    iamApi.fetchUsers.mockRejectedValue(new Error("Fetch failed"));
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.usersLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Fetch users failed",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it("deletes a user and updates state", async () => {
    iamApi.fetchUsers.mockResolvedValue({ users: mockUsers });
    iamApi.deleteUser.mockResolvedValue({});
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    // Load users
    await act(async () => {
      await result.current.fetchUsers();
    });

    // Delete User One
    await act(async () => {
      await result.current.deleteUser("1");
    });

    expect(iamApi.deleteUser).toHaveBeenCalledWith("1");
    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].id).toBe("2");
  });

  it("updates user role and updates state", async () => {
    iamApi.fetchUsers.mockResolvedValue({ users: mockUsers });
    iamApi.updateUserRole.mockResolvedValue({});
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    // Load users
    await act(async () => {
      await result.current.fetchUsers();
    });

    // Promote User One
    await act(async () => {
      await result.current.updateUserRole("1", "role_admin_id");
    });

    expect(iamApi.updateUserRole).toHaveBeenCalledWith("1", "role_admin_id");
    expect(result.current.users.find((u) => u.id === "1").role).toBe("ADMIN");
  });

  describe("Canteen Actions", () => {
    it("fetches recipes and updates state", async () => {
      const mockRecipes = [{ id: 1, title: "Soup" }];
      canteenApi.fetchRecipes.mockResolvedValue(mockRecipes);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      let promise;
      act(() => {
        promise = result.current.getRecipes(20, 0, {});
      });

      expect(result.current.recipesLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.recipesLoading).toBe(false);
      expect(result.current.recipes).toEqual(mockRecipes);
      expect(canteenApi.fetchRecipes).toHaveBeenCalledWith(20, 0, undefined, undefined, undefined);
    });

    it("fetches user profile recipes and updates state", async () => {
      const mockRecipes = [{ id: 1, title: "User Recipe" }];
      canteenApi.fetchUserRecipes.mockResolvedValue(mockRecipes);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      let promise;
      act(() => {
        promise = result.current.getUserProfileRecipes("u1", 20, 0);
      });

      expect(result.current.recipesLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.recipesLoading).toBe(false);
      expect(result.current.userProfileRecipes).toEqual(mockRecipes);
      expect(canteenApi.fetchUserRecipes).toHaveBeenCalledWith("u1", 20, 0);
    });

    it("fetches single recipe and updates state", async () => {
      const mockRecipe = { id: "101", title: "Cake" };
      canteenApi.fetchRecipe.mockResolvedValue(mockRecipe);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      await act(async () => {
        await result.current.getRecipe("101");
      });

      expect(result.current.currentRecipe).toEqual(mockRecipe);
      expect(canteenApi.fetchRecipe).toHaveBeenCalledWith("101");
    });

    it("fetches ingredients and updates state", async () => {
      const mockIngredients = [{ id: "i1", name: "Salt" }];
      canteenApi.fetchIngredients.mockResolvedValue(mockIngredients);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      await act(async () => {
        await result.current.getIngredients();
      });

      expect(result.current.ingredients).toEqual(mockIngredients);
    });

    it("fetches tags and updates state", async () => {
      const mockTags = [{ id: "t1", name: "Vegan" }];
      canteenApi.fetchTags.mockResolvedValue(mockTags);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      await act(async () => {
        await result.current.getTags();
      });

      expect(result.current.tags).toEqual(mockTags);
    });

    it("toggles recipe like and updates current recipe if matches", async () => {
      const recipe = { id: "101", likes: [] };
      const updatedRecipe = { id: "101", likes: [{ user_id: "u1" }] };

      canteenApi.fetchRecipe.mockResolvedValueOnce(recipe);
      canteenApi.likeRecipe.mockResolvedValue({});
      canteenApi.fetchRecipe.mockResolvedValueOnce(updatedRecipe); // For the refresh

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      // Set current recipe
      await act(async () => {
        await result.current.getRecipe("101");
      });

      // Like
      await act(async () => {
        await result.current.toggleRecipeLike("101", false);
      });

      expect(canteenApi.likeRecipe).toHaveBeenCalledWith("101");
      expect(canteenApi.fetchRecipe).toHaveBeenCalledTimes(2);
      expect(result.current.currentRecipe).toEqual(updatedRecipe);
    });

    it("creates a tag and updates state", async () => {
      const newTag = { id: "t1", name: "Gluten-Free" };
      canteenApi.createTag.mockResolvedValue(newTag);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      await act(async () => {
        await result.current.createTag("Gluten-Free");
      });

      expect(canteenApi.createTag).toHaveBeenCalledWith("Gluten-Free");
      expect(result.current.tags).toContainEqual(newTag);
    });

    it("creates an ingredient and updates state", async () => {
      const newIngredient = { id: "i99", name: "Saffron" };
      canteenApi.createIngredient.mockResolvedValue(newIngredient);

      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
      const { result } = renderHook(() => useContext(DataContext), { wrapper });

      await act(async () => {
        await result.current.createIngredient("Saffron");
      });

      expect(canteenApi.createIngredient).toHaveBeenCalledWith("Saffron");
      expect(result.current.ingredients[0]).toEqual(newIngredient);
    });
  });
});