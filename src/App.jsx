import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { win95Theme } from "./theme";
import AuthProvider from "./context/auth/AuthProvider";
import DataProvider from "./context/data/DataProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <MantineProvider theme={win95Theme}>
      <AuthProvider>
        <DataProvider>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route path="*" element={<Login />} />
            </Routes>
          </div>
        </DataProvider>
      </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
