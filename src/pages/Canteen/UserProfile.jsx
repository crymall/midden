import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@headlessui/react";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";
import RecipeList from "../../components/canteen/RecipeList";
import ListList from "../../components/canteen/ListList";
import PaginationControls from "../../components/canteen/PaginationControls";
import CreateListModal from "../../components/canteen/CreateListModal";

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
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

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

  const handleCreateList = async (name) => {
    setCreatingList(true);
    try {
      await canteenApi.createList(name);
      await getUserLists(id, listLimit, (listPage - 1) * listLimit);
      setIsCreateListOpen(false);
      setActiveTab("lists");
    } catch (error) {
      console.error("Failed to create list", error);
    } finally {
      setCreatingList(false);
    }
  };

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-gothic text-4xl font-bold text-white">
          {viewedUser.username}
        </h1>
        {isOwnProfile && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateListOpen(true)}
              className="bg-accent hover:bg-accent/80 px-3 py-1 text-sm font-bold text-white transition-colors"
            >
              + List
            </Button>
            <Link to="/applications/canteen/recipes/new">
              <Button className="bg-accent hover:bg-accent/80 px-3 py-1 text-sm font-bold text-white transition-colors">+ Recipe</Button>
            </Link>
          </div>
        )}
      </div>

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

      <CreateListModal
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        onCreate={handleCreateList}
        loading={creatingList}
      />
    </MiddenCard>
  );
};

export default UserProfile;
