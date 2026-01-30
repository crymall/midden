import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/auth/useAuth";

const RequireAuth = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
