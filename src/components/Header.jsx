import { Button } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const Header = ({ user, logout }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-darkAmethyst p-4 flex justify-between items-center border-b-4 border-dashed border-evergreen">
      <div>
        <h1
          onClick={() => navigate("/")}
          className="text-5xl font-gothic text-white cursor-pointer hover:text-lavender transition-colors text-shadow-hard-greyOlive text-shadow-lg tracking-wide"
        >
          Midden
        </h1>
      </div>
      <div className="flex items-center gap-4 font-mono">
        <span className="text-lavender hidden md:block">
          <strong>{user.username}</strong>
        </span>
        <Button
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          className="bg-greyOlive hover:bg-paleSlate text-onyx py-1 px-3 transition-colors text-2xl"
        >
          🛠
        </Button>
        <Button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          aria-label="Logout"
          className="bg-greyOlive hover:bg-paleSlate text-onyx py-1 px-3 transition-colors text-2xl"
        >
          🚪→
        </Button>
      </div>
    </header>
  );
};

export default Header;
