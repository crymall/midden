import { Link } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  const truncateDescription = (text) => {
    if (!text) return "";
    if (text.length <= 150) return text;
    const sub = text.substring(0, 150);
    const lastSpace = sub.lastIndexOf(" ");
    return (lastSpace > 0 ? sub.substring(0, lastSpace) : sub) + "...";
  };

  return (
    <Link
      to={`/applications/canteen/recipes/${recipe.id}`}
      className="bg-primary/20 border-accent hover:bg-primary/40 group flex flex-col gap-2 border-2 border-dashed p-4 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-mono text-xl font-bold text-white transition-colors group-hover:text-lightestGrey">
          {recipe.title}
        </h3>
        {recipe.likes && recipe.likes.length > 0 && (
          <span className="text-accent text-xs font-mono font-bold">
            ♥ {recipe.likes.length}
          </span>
        )}
      </div>

      <p className="text-lightGrey mb-2 text-sm font-mono">
        {truncateDescription(recipe.description)}
      </p>

      <div className="mt-auto flex flex-wrap gap-2">
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
    </Link>
  );
};

export default RecipeCard;