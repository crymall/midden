import { useState, useEffect, useEffectEvent } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleAuthCheck = useEffectEvent(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch {
        logout();
      }
    }
    setDocumentsLoading(false);
  });

  useEffect(() => {
    handleAuthCheck();
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await api.post("/login", { username, password });

      localStorage.setItem("token", data.token);
      const decoded = jwtDecode(data.token);
      setUser(decoded);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, documentsLoading }}>
      {!documentsLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
