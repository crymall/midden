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

  const getIngredients = useCallback(async () => {
    try {
      const data = await canteenApi.fetchIngredients(100, 0);
      setIngredients(data);
    } catch (err) {
      console.error("Fetch ingredients failed", err);
    }
  }, []);

  const getTags = useCallback(async () => {
    try {
      const data = await canteenApi.fetchTags(100, 0);
      setTags(data);
    } catch (err) {
      console.error("Fetch tags failed", err);
    }
  }, []);

  const getUserLists = useCallback(async (userId) => {
    try {
      const data = await canteenApi.fetchUserLists(userId);
      setUserLists(data);
    } catch (err) {
      console.error("Fetch user lists failed", err);
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
        getTags,
        getUserLists,
        toggleRecipeLike,
        canteenApi,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
