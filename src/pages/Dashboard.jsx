import { Outlet } from "react-router-dom";
import useAuth from "../context/auth/useAuth";
import Header from "../components/Header";

const Dashboard = ({ navMeta }) => {
  const { user, logout } = useAuth();
  const { title, titleLink, navLinks} = navMeta;

  return (
    <div data-theme={title.toLowerCase()}>
      <Header user={user} logout={logout} title={title} titleLink={titleLink} navLinks={navLinks} />
      <main className="bg-dark flex min-h-screen items-start justify-center md:pt-5">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
