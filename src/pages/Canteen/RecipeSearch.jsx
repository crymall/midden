import { useEffect, useState, useRef } from "react";
import { Button, Select } from "@headlessui/react";
import useData from "../../context/data/useData";
import MiddenCard from "../../components/MiddenCard";
import RecipeList from "../../components/canteen/RecipeList";
import RecipeFilter from "../../components/Canteen/RecipeFilter";

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
    <MiddenCard title="Find Recipes">
      <RecipeFilter onFilter={handleFilter} />
      <RecipeList recipes={recipes} loading={recipesLoading} />

      <div className="border-grey mt-6 flex flex-col items-center justify-between gap-4 border-t-2 pt-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <label className="text-lightestGrey text-sm font-bold">
            Rows per page:
          </label>
          <Select
            value={limit}
            onChange={handleLimitChange}
            className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey border p-1 focus:outline-none"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            disabled={page === 1 || recipesLoading}
            onClick={() => handlePageChange(page - 1)}
            className="hover:text-lightestGrey text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Prev
          </Button>
          <span className="text-lightestGrey font-mono">Page {page}</span>
          <Button
            disabled={recipes.length < limit || recipesLoading}
            onClick={() => handlePageChange(page + 1)}
            className="hover:text-lightestGrey text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </Button>
        </div>
      </div>
    </MiddenCard>
  );
};

export default RecipeSearch;