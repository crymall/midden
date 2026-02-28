import { useEffect, useState, useRef } from "react";
import useData from "../../context/data/useData";
import MiddenCard from "../../components/MiddenCard";
import RecipeList from "../../components/canteen/RecipeList";
import RecipeFilter from "../../components/canteen/RecipeFilter";
import PaginationControls from "../../components/PaginationControls";

const RecipeSearch = () => {
  const { recipes, recipesLoading, getRecipes } = useData();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({});
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      // Cache check: Only fetch if we don't have recipes already
      if (recipes.length === 0) {
        getRecipes(limit, 0, filters);
      }
      mounted.current = true;
    }
  }, [getRecipes, recipes.length, limit, filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    getRecipes(limit, 0, newFilters);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    getRecipes(limit, (newPage - 1) * limit, filters);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1);
    getRecipes(newLimit, 0, filters);
  };

  return (
    <MiddenCard>
      <h2 className="mb-4 font-gothic text-4xl font-bold text-white">
        Find Recipes
      </h2>
      <RecipeFilter onFilter={handleFilter} />
      <RecipeList recipes={recipes} loading={recipesLoading} />

      <PaginationControls
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={recipesLoading}
        isNextDisabled={recipes.length < limit}
      />
    </MiddenCard>
  );
};

export default RecipeSearch;