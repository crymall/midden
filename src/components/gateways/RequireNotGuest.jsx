import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../context/auth/useAuth";

const RequireNotGuest = () => {
  const { user } = useAuth();

  if (!user || user.username === "guest") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireNotGuest;
