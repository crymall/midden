import axios from "axios";

const canteenApi = axios.create({
  baseURL: "/canteen",
});

canteenApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const fetchRecipes = async (
  limit,
  offset,
  tags = [],
  ingredients = [],
  title = "",
) => {
  const response = await canteenApi.get("/recipes", {
    params: { limit, offset, tags, ingredients, title },
  });
  return response.data;
};

export const fetchPopularRecipes = async (limit, offset) => {
  const response = await canteenApi.get("/recipes/popular", {
    params: { limit, offset },
  });
  return response.data;
};

export const fetchRecipe = async (id) => {
  const response = await canteenApi.get(`/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await canteenApi.post("/recipes", recipeData);
  return response.data;
};

export const likeRecipe = async (id) => {
  const response = await canteenApi.post(`/recipes/${id}/likes`);
  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await canteenApi.put(`/recipes/${id}`, recipeData);
  return response.data;
};

export const unlikeRecipe = async (id) => {
  const response = await canteenApi.delete(`/recipes/${id}/likes`);
  return response.data;
};

export const addRecipeIngredient = async (recipeId, ingredientData) => {
  const response = await canteenApi.post(
    `/recipes/${recipeId}/ingredients`,
    ingredientData,
  );
  return response.data;
};

export const addRecipeTag = async (recipeId, tagId) => {
  const response = await canteenApi.post(`/recipes/${recipeId}/tags`, {
    tag_id: tagId,
  });
  return response.data;
};

export const removeRecipeTag = async (recipeId, tagId) => {
  const response = await canteenApi.delete(
    `/recipes/${recipeId}/tags/${tagId}`,
  );
  return response.data;
};

export const removeRecipeIngredient = async (recipeId, ingredientId) => {
  const response = await canteenApi.delete(
    `/recipes/${recipeId}/ingredients/${ingredientId}`,
  );
  return response.data;
};

export const fetchIngredients = async (limit, offset, name) => {
  const response = await canteenApi.get("/ingredients", {
    params: { limit, offset, name },
  });
  return response.data;
};

export const createIngredient = async (name) => {
  const response = await canteenApi.post("/ingredients", { name });
  return response.data;
};

export const fetchLists = async (limit, offset, name, sort, order) => {
  const response = await canteenApi.get("/lists", {
    params: { limit, offset, name, sort, order },
  });
  return response.data;
};

export const fetchUserLists = async (
  userId,
  limit,
  offset,
  name,
  sort,
  order,
) => {
  const response = await canteenApi.get(`/lists/user/${userId}`, {
    params: { limit, offset, name, sort, order },
  });
  return response.data;
};

export const fetchList = async (id) => {
  const response = await canteenApi.get(`/lists/${id}`);
  return response.data;
};

export const deleteList = async (id) => {
  const response = await canteenApi.delete(`/lists/${id}`);
  return response.data;
};

export const createList = async (name) => {
  const response = await canteenApi.post("/lists", { name });
  return response.data;
};

export const fetchListRecipes = async (id, limit, offset) => {
  const response = await canteenApi.get(`/lists/${id}/recipes`, {
    params: { limit, offset },
  });
  return response.data;
};

export const addRecipeToList = async (id, recipeId) => {
  const response = await canteenApi.post(`/lists/${id}/recipes`, {
    recipe_id: recipeId,
  });
  return response.data;
};

export const removeRecipeFromList = async (id, recipeId) => {
  const response = await canteenApi.delete(`/lists/${id}/recipes/${recipeId}`);
  return response.data;
};

export const fetchTags = async (limit, offset) => {
  const response = await canteenApi.get("/tags", { params: { limit, offset } });
  return response.data;
};

export const createTag = async (name) => {
  const response = await canteenApi.post("/tags", { name });
  return response.data;
};

export const fetchUsers = async (limit, offset) => {
  const response = await canteenApi.get("/users", {
    params: { limit, offset },
  });
  return response.data;
};

export const fetchUser = async (id) => {
  const response = await canteenApi.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (username, iamId) => {
  const response = await canteenApi.post("/users", { username, iam_id: iamId });
  return response.data;
};
