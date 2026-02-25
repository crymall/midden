import { Link } from "react-router-dom";
import Can from "../gateways/Can";
import ListAddPopover from "./ListAddPopover";
import { PERMISSIONS } from "../../utils/constants";

const RecipeCard = ({ recipe }) => {

  const truncateDescription = (text) => {
    if (!text) return "";
    if (text.length <= 150) return text;
    const sub = text.substring(0, 150);
    const lastSpace = sub.lastIndexOf(" ");
    return (lastSpace > 0 ? sub.substring(0, lastSpace) : sub) + "...";
  };

  return (
    <>
      <div className="bg-primary/20 border-accent hover:bg-primary/40 group relative flex flex-col gap-2 border-2 border-dashed p-4 transition-all">
        <Link
          to={`/applications/canteen/recipes/${recipe.id}`}
          className="absolute inset-0 z-0"
        >
          <span className="sr-only">View {recipe.title}</span>
        </Link>

        <div className="pointer-events-none relative z-10 flex items-start justify-between gap-2">
        <h3 className="font-mono text-xl font-bold text-white transition-colors group-hover:text-lightestGrey">
          {recipe.title}
        </h3>
        {recipe.likes && recipe.likes.length > 0 && (
          <span className="text-accent text-xs font-mono font-bold">
            ♥ {recipe.likes.length}
          </span>
        )}
      </div>

      <p className="text-lightGrey pointer-events-none relative z-10 mb-2 font-mono text-sm">
        {truncateDescription(recipe.description)}
      </p>

      <div className="pointer-events-none relative z-10 mt-auto flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap gap-2">
        {recipe.tags &&
          recipe.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-accent/30 text-lightestGrey border-accent/50 border px-2 py-0.5 text-xs font-bold"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <Can perform={PERMISSIONS.writeCanteen}>
          <ListAddPopover
            recipeId={recipe.id}
            className="pointer-events-auto relative z-20"
            buttonClassName="bg-grey hover:bg-lightGrey text-dark px-2 py-1 text-xs font-bold transition-colors focus:outline-none"
            panelClassName="right-0 bottom-full mb-2"
            label="+ Add"
          />
        </Can>
      </div>
      </div>
    </>
  );
};

export default RecipeCard;