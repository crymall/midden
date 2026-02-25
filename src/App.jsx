import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/auth/AuthProvider";
import DataProvider from "./context/data/DataProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Explorer from "./pages/Explorer";
import Settings from "./pages/Settings";
import Experiments from "./pages/Experiments";
import NotFound from "./pages/NotFound";
import CanteenHome from "./pages/Canteen/CanteenHome";
import RecipeSearch from "./pages/Canteen/RecipeSearch";
import RecipeDetail from "./pages/Canteen/RecipeDetail";
import NewRecipe from "./pages/Canteen/NewRecipe";
import RequireNotGuest from "./components/gateways/RequireNotGuest";
import MyLists from "./pages/Canteen/MyLists";
import ListView from "./pages/Canteen/ListView";
import { navMeta } from "./utils/constants";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            // Login route
            <Route path="/login" element={<Login />} />

            // Canteen routes
            <Route
              path="/applications/canteen"
              element={<Dashboard navMeta={navMeta.canteen} />}
            >
              <Route index element={<RecipeSearch />} />
              <Route path="recipes" element={<RecipeSearch />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />

              <Route element={<RequireNotGuest />}>
                <Route path="recipes/new" element={<NewRecipe />} />
                <Route path="my-lists" element={<MyLists />} />
                <Route path="my-lists/:id" element={<ListView />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>

            // Midden routes
            <Route path="/" element={<Dashboard navMeta={navMeta.midden} />}>
              <Route index element={<Explorer />} />
              <Route path="/experiments" element={<Experiments />} />
              <Route element={<RequireNotGuest />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
