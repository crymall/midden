import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";
import RecipeList from "../../components/canteen/RecipeList";

const ListView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { userLists, recipesLoading, getUserLists, getListRecipes, currentListRecipes } = useData();

  // Find the specific list from the cached userLists in context
  const currentList = userLists.find((list) => list.id === id);

  useEffect(() => {
    if (user && !currentList) {
      getUserLists(user.id);
    }
  }, [user, currentList, getUserLists]);

  useEffect(() => {
    if (id) {
      getListRecipes(id);
    }
  }, [id, getListRecipes]);

  if (!currentList && !recipesLoading) {
    return (
      <MiddenCard title="List Not Found">
        <div className="flex flex-col items-center gap-4 p-8">
          <p className="text-lightGrey font-mono">
            The requested list could not be found.
          </p>
          <Link
            to="/applications/canteen/my-lists"
            className="text-accent font-bold hover:underline"
          >
            ← Back to My Lists
          </Link>
        </div>
      </MiddenCard>
    );
  }

  return (
    <MiddenCard title={currentList?.name || "Loading List..."}>
      <div className="mb-6 flex flex-col gap-2">
        <Link
          to="/applications/canteen/my-lists"
          className="text-lightGrey hover:text-white font-mono text-sm transition-colors"
        >
          ← Back to My Lists
        </Link>
      </div>

      <RecipeList
        recipes={currentListRecipes}
        loading={recipesLoading}
      />
    </MiddenCard>
  );
};

export default ListView;
