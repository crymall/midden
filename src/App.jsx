import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/auth/AuthProvider";
import DataProvider from "./context/data/DataProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Explorer from "./pages/Explorer";
import Settings from "./pages/Settings";
import Applications from "./pages/Applications";
import Experiments from "./pages/Experiments";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/gateways/RequireAuth";
import RequireNotGuest from "./components/gateways/RequireNotGuest";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<Dashboard />}>
                <Route index element={<Explorer />} />
                <Route element={<RequireNotGuest />}>
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="/applications" element={<Applications />} />
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
