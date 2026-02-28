import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";
import RecipeList from "../../components/canteen/RecipeList";
import ListList from "../../components/canteen/ListList";
import PaginationControls from "../../components/PaginationControls";

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const {
    canteenApi,
    getUserProfileRecipes,
    userProfileRecipes,
    getUserLists,
    userLists,
    recipesLoading,
  } = useData();
  const [viewedUser, setViewedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState("recipes");

  // Pagination State
  const [recipePage, setRecipePage] = useState(1);
  const [recipeLimit, setRecipeLimit] = useState(20);
  const [listPage, setListPage] = useState(1);
  const [listLimit, setListLimit] = useState(20);
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoadingUser(true);
        try {
          const userData = await canteenApi.fetchUser(id);
          setViewedUser(userData);
        } catch (error) {
          console.error("Failed to load user profile data", error);
        } finally {
          setLoadingUser(false);
        }
      }
    };
    loadData();
  }, [id, canteenApi]);

  useEffect(() => {
    if (id) {
      getUserProfileRecipes(id, recipeLimit, (recipePage - 1) * recipeLimit);
    }
  }, [id, recipePage, recipeLimit, getUserProfileRecipes]);

  useEffect(() => {
    if (id) {
      setListsLoading(true);
      getUserLists(id, listLimit, (listPage - 1) * listLimit).finally(() =>
        setListsLoading(false),
      );
    }
  }, [id, listPage, listLimit, getUserLists]);

  const isOwnProfile =
    currentUser &&
    viewedUser &&
    String(currentUser.id) === String(viewedUser.id);

  if (loadingUser) {
    return (
      <MiddenCard>
        <div className="flex justify-center p-8">
          <p className="text-lightestGrey animate-pulse font-mono text-xl">
            Loading profile...
          </p>
        </div>
      </MiddenCard>
    );
  }

  if (!viewedUser) {
    return (
      <MiddenCard>
        <div className="flex justify-center p-8">
          <p className="text-lightGrey font-mono text-lg">User not found.</p>
        </div>
      </MiddenCard>
    );
  }

  return (
    <MiddenCard>
      <h1 className="font-gothic text-4xl font-bold text-white mb-4">
        {viewedUser.username}
      </h1>

      {/* Tabs */}
      <div className="border-grey mb-6 flex border-b">
        <button
          onClick={() => setActiveTab("recipes")}
          className={`px-6 py-2 font-mono text-lg font-bold transition-colors ${
            activeTab === "recipes"
              ? "border-accent text-accent border-b-2"
              : "text-lightGrey hover:text-white"
          }`}
        >
          {viewedUser.username}'s Recipes
        </button>
        <button
          onClick={() => setActiveTab("lists")}
          className={`px-6 py-2 font-mono text-lg font-bold transition-colors ${
            activeTab === "lists"
              ? "border-accent text-accent border-b-2"
              : "text-lightGrey hover:text-white"
          }`}
        >
          {viewedUser.username}'s Lists
        </button>
      </div>

      {activeTab === "recipes" ? (
        <div>
          <RecipeList recipes={userProfileRecipes} loading={recipesLoading} />
          <PaginationControls
            page={recipePage}
            limit={recipeLimit}
            onPageChange={setRecipePage}
            onLimitChange={(e) => {
              setRecipeLimit(Number(e.target.value));
              setRecipePage(1);
            }}
            loading={recipesLoading}
            isNextDisabled={userProfileRecipes.length < recipeLimit}
          />
        </div>
      ) : (
        <div>
          <ListList
            fetchingLists={listsLoading}
            userLists={userLists}
            emptyMessage="No lists found for this user."
          />
          {isOwnProfile && (
            <div className="mt-6 flex justify-end">
              <Link
                to="/applications/canteen/my-lists"
                className="text-accent font-mono font-bold transition-colors hover:text-white"
              >
                Manage My Lists →
              </Link>
            </div>
          )}
          <PaginationControls
            page={listPage}
            limit={listLimit}
            onPageChange={setListPage}
            onLimitChange={(e) => {
              setListLimit(Number(e.target.value));
              setListPage(1);
            }}
            loading={listsLoading}
            isNextDisabled={userLists.length < listLimit}
          />
        </div>
      )}
    </MiddenCard>
  );
};

export default UserProfile;
