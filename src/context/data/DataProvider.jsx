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
  const [userProfileRecipes, setUserProfileRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [tags, setTags] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [currentListRecipes, setCurrentListRecipes] = useState([]);
  const [comboboxLists, setComboboxLists] = useState([]);
  const [comboboxListsLastFetched, setComboboxListsLastFetched] = useState(0);
  const [currentComboboxQuery, setCurrentComboboxQuery] = useState("");
  const [comboboxListsUserId, setComboboxListsUserId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [threads, setThreads] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

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

  const getUserProfileRecipes = useCallback(async (userId, limit = 50, offset = 0) => {
    setRecipesLoading(true);
    try {
      const data = await canteenApi.fetchUserRecipes(userId, limit, offset);
      setUserProfileRecipes(data);
    } catch (err) {
      console.error("Fetch user recipes failed", err);
    } finally {
      setRecipesLoading(false);
    }
  }, []);

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
      setComboboxListsUserId(userId);
      setCurrentComboboxQuery(query);
      if (!query) {
        setComboboxListsLastFetched(Date.now());
      }
    } catch (err) {
      console.error("Fetch combobox lists failed", err);
    }
  }, []);

  const hoistComboboxList = useCallback((listId) => {
    setComboboxLists((prev) => {
      const index = prev.findIndex((list) => list.id === listId);
      if (index <= 0) return prev;

      const newLists = [...prev];
      const [item] = newLists.splice(index, 1);
      newLists.unshift(item);
      return newLists;
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

  const getFollowers = useCallback(async (id) => {
    setRelationshipsLoading(true);
    try {
      const data = await canteenApi.fetchFollowers(id);
      setFollowers(data);
    } catch (err) {
      console.error("Fetch followers failed", err);
    } finally {
      setRelationshipsLoading(false);
    }
  }, []);

  const getFollowing = useCallback(async (id) => {
    setRelationshipsLoading(true);
    try {
      const data = await canteenApi.fetchFollowing(id);
      setFollowing(data);
    } catch (err) {
      console.error("Fetch following failed", err);
    } finally {
      setRelationshipsLoading(false);
    }
  }, []);

  const getFriends = useCallback(async (id) => {
    setRelationshipsLoading(true);
    try {
      const data = await canteenApi.fetchFriends(id);
      setFriends(data);
    } catch (err) {
      console.error("Fetch friends failed", err);
    } finally {
      setRelationshipsLoading(false);
    }
  }, []);

  const followUser = async (id) => {
    try {
      await canteenApi.followUser(id);
    } catch (err) {
      console.error("Follow user failed", err);
    }
  };

  const unfollowUser = async (id) => {
    try {
      await canteenApi.unfollowUser(id);
    } catch (err) {
      console.error("Unfollow user failed", err);
    }
  };

  const getThreads = useCallback(async (limit = 50, offset = 0) => {
    setMessagesLoading(true);
    try {
      const data = await canteenApi.fetchThreads(limit, offset);
      setThreads(data);
    } catch (err) {
      console.error("Fetch threads failed", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const getConversation = useCallback(async (otherUserId, limit = 50, offset = 0) => {
    setMessagesLoading(true);
    try {
      const data = await canteenApi.fetchConversation(otherUserId, limit, offset);
      setCurrentConversation(data);
    } catch (err) {
      console.error("Fetch conversation failed", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const sendMessage = async (receiverId, content, recipeId = null, listId = null) => {
    try {
      const data = await canteenApi.sendMessage(receiverId, content, recipeId, listId);
      // Optimistically add to current conversation if we are viewing it
      setCurrentConversation((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Send message failed", err);
      throw err;
    }
  };

  const getNotifications = useCallback(async (limit = 50, offset = 0) => {
    setNotificationsLoading(true);
    try {
      const data = await canteenApi.fetchNotifications(limit, offset);
      setNotifications(data);
    } catch (err) {
      console.error("Fetch notifications failed", err);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

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
        userProfileRecipes,
        getUserProfileRecipes,
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
        comboboxListsLastFetched,
        currentComboboxQuery,
        comboboxListsUserId,
        hoistComboboxList,
        currentListRecipes,
        toggleRecipeLike,
        createRecipe,
        createTag,
        createIngredient,
        followers,
        following,
        friends,
        relationshipsLoading,
        getFollowers,
        getFollowing,
        getFriends,
        followUser,
        unfollowUser,
        threads,
        currentConversation,
        messagesLoading,
        getThreads,
        getConversation,
        sendMessage,
        notifications,
        notificationsLoading,
        getNotifications,
        canteenApi,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
