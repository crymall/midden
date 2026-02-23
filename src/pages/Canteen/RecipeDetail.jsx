import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@headlessui/react";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";
import Can from "../../components/gateways/Can";
import ListAddPopover from "../../components/canteen/ListAddPopover";

const RecipeDetail = () => {
  const { id } = useParams();
  const {
    currentRecipe,
    recipesLoading,
    getRecipe,
    toggleRecipeLike,
    getUserLists,
  } = useData();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      getRecipe(id);
    }
  }, [id, getRecipe]);

  useEffect(() => {
    if (user) {
      getUserLists(user.id);
    }
  }, [user, getUserLists]);

  if (recipesLoading) {
    return (
      <MiddenCard>
        <div className="flex justify-center p-8">
          <p className="text-lightestGrey animate-pulse font-mono text-xl">
            Loading recipe...
          </p>
        </div>
      </MiddenCard>
    );
  }

  if (!currentRecipe) {
    return (
      <MiddenCard>
        <div className="flex justify-center p-8">
          <p className="text-lightGrey font-mono text-lg">Recipe not found.</p>
        </div>
      </MiddenCard>
    );
  }

  const isLiked = currentRecipe.likes?.some(
    (like) => like.user_id === user?.id,
  );

  const handleLike = () => {
    toggleRecipeLike(currentRecipe.id, isLiked);
  };

  return (
    <MiddenCard>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-grey pb-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-col gap-0">
                <h1 className="font-mono text-3xl leading-none font-bold text-white">
                  {currentRecipe.title}
                </h1>
                {currentRecipe.author && (
                  <p className="text-lightGrey font-mono text-sm">
                    By{" "}
                    <span className="text-accent">
                      {currentRecipe.author.username}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 md:mb-4">
                {currentRecipe.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-accent/30 text-lightestGrey border-accent/50 border px-2 py-0.5 font-mono text-xs font-bold"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            <Can perform="write:canteen">
              <div className="flex gap-2">
                <Button
                  onClick={handleLike}
                  className={`border px-2 py-1 font-bold transition-colors ${
                    isLiked
                      ? "bg-accent border-accent text-white"
                      : "text-lightestGrey border-grey hover:border-lightestGrey bg-transparent"
                  }`}
                >
                  {isLiked ? "♥ Liked" : "♡ Like"}
                </Button>
                <ListAddPopover
                  recipeId={currentRecipe.id}
                  className="relative"
                  buttonClassName="bg-grey hover:bg-lightGrey text-dark px-2 py-1 font-bold transition-colors"
                  panelClassName="right-0 top-full mt-2"
                  label="+ Add to List"
                />
              </div>
            </Can>
          </div>
          <p className="text-lightestGrey font-mono text-lg italic mt-4 md:mt-0">
            {currentRecipe.description}
          </p>
        </div>

        {/* Stats */}
        <div className="text-lightestGrey grid grid-cols-3 gap-4 rounded-lg bg-white/5 p-4 text-center font-mono">
          <div>
            <span className="text-grey block text-xs tracking-wider uppercase">
              Prep Time
            </span>
            <span className="text-xl font-bold">
              {currentRecipe.prep_time_minutes}m
            </span>
          </div>
          <div>
            <span className="text-grey block text-xs tracking-wider uppercase">
              Cook Time
            </span>
            <span className="text-xl font-bold">
              {currentRecipe.cook_time_minutes}m
            </span>
          </div>
          <div>
            <span className="text-grey block text-xs tracking-wider uppercase">
              Servings
            </span>
            <span className="text-xl font-bold">{currentRecipe.servings}</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <h3 className="font-gothic border-grey mb-4 border-b pb-2 text-3xl text-white">
              Ingredients
            </h3>
            <ul className="text-lightestGrey space-y-2 font-mono">
              {currentRecipe.ingredients?.map((ing, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>
                    {ing.quantity} {ing.unit} <strong>{ing.name}</strong>
                    {ing.notes && (
                      <span className="text-grey text-sm italic">
                        {" "}
                        ({ing.notes})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <h3 className="font-gothic border-grey mb-4 border-b pb-2 text-3xl text-white">
              Instructions
            </h3>
            <div className="text-lightestGrey font-mono leading-relaxed whitespace-pre-wrap">
              {currentRecipe.instructions}
            </div>
          </div>
        </div>
      </div>

    </MiddenCard>
  );
};

export default RecipeDetail;
