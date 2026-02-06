import { Outlet } from "react-router-dom";
import useAuth from "../context/auth/useAuth";
import Header from "../components/Header";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <Header user={user} logout={logout} />
      <main className="min-h-screen flex justify-center items-start bg-onyx md:pt-5">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
