import { useState, useEffect, useEffectEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthContext from "./AuthContext";
import * as api from "../../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const processToken = (token) => {
    try {
      if (!token) {
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setUser(null);
      } else {
        localStorage.setItem("token", token);
        setUser({ ...decoded, token });
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const checkToken = useEffectEvent(processToken);
  const showPage = useEffectEvent(() => setLoading(false));

  useEffect(() => {
    const token = localStorage.getItem("token");
    checkToken(token);
    showPage();
  }, []);

  const login = async (username, password) => {
    return await api.login(username, password);
  };

  const verifyLogin = async (userId, code) => {
    const data = await api.verify2FA(userId, code);
    processToken(data.token);

    const origin = location.state?.from?.pathname || "/dashboard";
    navigate(origin);

    return data;
  };

  const register = async (username, email, password) => {
    return await api.register(username, email, password);
  };

  const logout = () => {
    processToken(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    login,
    verifyLogin,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
