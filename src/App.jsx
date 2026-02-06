import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/auth/AuthProvider";
import DataProvider from "./context/data/DataProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Explorer from "./pages/Explorer";
import Settings from "./pages/Settings";
import RequireAuth from "./components/RequireAuth";

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
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Login />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
