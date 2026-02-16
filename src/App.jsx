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
import RequireAuth from "./components/gateways/RequireAuth";
import RequireNotGuest from "./components/gateways/RequireNotGuest";
import { navMeta } from "./utils/constants";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route
                path="/applications/canteen"
                element={<Dashboard navMeta={navMeta.canteen} />}
              >
                <Route index element={<CanteenHome />} />
                <Route path="recipes" element={<RecipeSearch />} />
                <Route path="recipes/:id" element={<RecipeDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="/" element={<Dashboard navMeta={navMeta.midden} />}>
                <Route index element={<Explorer />} />
                <Route element={<RequireNotGuest />}>
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="/experiments" element={<Experiments />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
