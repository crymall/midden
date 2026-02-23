import { useState, useCallback } from "react";
import DataContext from "./DataContext";
import * as iamApi from "../../services/iamApi";
import * as canteenApi from "../../services/canteenApi";
import { ROLES } from "../../utils/constants";

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Canteen State
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [tags, setTags] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [currentListRecipes, setCurrentListRecipes] = useState([]);
  const [comboboxLists, setComboboxLists] = useState([]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await iamApi.fetchUsers();
      setUsers(data.users);
    } catch (err) {
      console.error("Fetch users failed", err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const deleteUser = async (id) => {
    try {
      await iamApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete user failed", err);
    }
  };

  const updateUserRole = async (userId, roleId) => {
    try {
      await iamApi.updateUserRole(userId, roleId);
      const roleName = Object.keys(ROLES).find((key) => ROLES[key] === roleId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: roleName } : u))
      );
    } catch (err) {
      console.error("Update user role failed", err);
    }
  };

  // Canteen Actions
  const getRecipes = useCallback(
    async (limit = 50, offset = 0, filters = {}) => {
      setRecipesLoading(true);
      try {
        const { tags, ingredients, title } = filters;
        const data = await canteenApi.fetchRecipes(
          limit,
          offset,
          tags,
          ingredients,
          title,
        );
        setRecipes(data);
      } catch (err) {
        console.error("Fetch recipes failed", err);
      } finally {
        setRecipesLoading(false);
      }
    },
    [],
  );

  const getPopularRecipes = useCallback(async (limit = 50, offset = 0) => {
    setRecipesLoading(true);
    try {
      const data = await canteenApi.fetchPopularRecipes(limit, offset);
      setRecipes(data);
    } catch (err) {
      console.error("Fetch popular recipes failed", err);
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  const getRecipe = useCallback(async (id) => {
    setRecipesLoading(true);
    try {
      const data = await canteenApi.fetchRecipe(id);
      setCurrentRecipe(data);
    } catch (err) {
      console.error("Fetch recipe failed", err);
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  const getIngredients = useCallback(async (limit = 100, offset = 0, name = "") => {
    try {
      const data = await canteenApi.fetchIngredients(limit, offset, name);
      setIngredients(data);
    } catch (err) {
      console.error("Fetch ingredients failed", err);
    }
  }, []);

  const clearIngredients = useCallback(() => {
    setIngredients([]);
  }, []);

  const getTags = useCallback(async () => {
    try {
      const data = await canteenApi.fetchTags(100, 0);
      setTags(data);
    } catch (err) {
      console.error("Fetch tags failed", err);
    }
  }, []);

  const getUserLists = useCallback(async (userId, limit = 20, offset = 0, name = "", sort = "created_at", order = "DESC") => {
    try {
      const data = await canteenApi.fetchUserLists(userId, limit, offset, name, sort, order);
      setUserLists(data);
    } catch (err) {
      console.error("Fetch user lists failed", err);
    }
  }, []);

  const getComboboxLists = useCallback(async (userId, query = "") => {
    try {
      const data = await canteenApi.fetchUserLists(userId, 10, 0, query, "updated_at", "DESC");
      setComboboxLists(data);
    } catch (err) {
      console.error("Fetch combobox lists failed", err);
    }
  }, []);

  const updateComboboxListTimestamp = useCallback((listId) => {
    const now = new Date().toISOString();
    setComboboxLists((prev) => {
      if (prev.length === 0) return [];

      // Update the specific list's timestamp
      return prev.map((list) =>
        list.id === listId ? { ...list, updated_at: now } : list
      );
    });
  }, []);

  const getListRecipes = useCallback(async (id, limit, offset) => {
    setRecipesLoading(true);
    try {
      const data = await canteenApi.fetchListRecipes(id, limit, offset);
      setCurrentListRecipes(data);
    } catch (err) {
      console.error("Fetch list recipes failed", err);
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  const toggleRecipeLike = async (id, isLiked) => {
    try {
      if (isLiked) {
        await canteenApi.unlikeRecipe(id);
      } else {
        await canteenApi.likeRecipe(id);
      }
      if (currentRecipe && currentRecipe.id === id) {
        const updated = await canteenApi.fetchRecipe(id);
        setCurrentRecipe(updated);
      }
    } catch (err) {
      console.error("Toggle like failed", err);
    }
  };

  const createRecipe = async (recipeData) => {
    const data = await canteenApi.createRecipe(recipeData);
    return data;
  };

  const createTag = async (name) => {
    try {
      const data = await canteenApi.createTag(name);
      setTags((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Create tag failed", err);
      throw err;
    }
  };

  const createIngredient = async (name) => {
    try {
      const data = await canteenApi.createIngredient(name);
      setIngredients((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Create ingredient failed", err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        users,
        usersLoading,
        fetchUsers,
        deleteUser,
        updateUserRole,
        recipes,
        recipesLoading,
        currentRecipe,
        ingredients,
        tags,
        userLists,
        getRecipes,
        getPopularRecipes,
        getRecipe,
        getIngredients,
        clearIngredients,
        getTags,
        getUserLists,
        getListRecipes,
        comboboxLists,
        getComboboxLists,
        updateComboboxListTimestamp,
        currentListRecipes,
        toggleRecipeLike,
        createRecipe,
        createTag,
        createIngredient,
        canteenApi,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
