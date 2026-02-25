import { Button } from "@headlessui/react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import MobileBurgerMenu from "./MobileBurgerMenu";
import Can from "./gateways/Can";

const Header = ({ user, logout, title, titleLink, navLinks }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = user && user.username === "guest";

  const desktopNavLinks = navLinks.map((link) =>
    link.requiredPermission ? (
      <Can key={link.to} perform={link.requiredPermission}>
        <Link
          to={link.to}
          aria-label={link.ariaLabel}
          className="hover:text-lightestGrey font-mono text-white transition-colors"
        >
          {link.label}
        </Link>
      </Can>
    ) : (
      <Link
        key={link.to}
        to={link.to}
        aria-label={link.ariaLabel}
        className="hover:text-lightestGrey font-mono text-white transition-colors"
      >
        {link.label}
      </Link>
    ),
  );

  const loggedInterface = (
    <>
      <span className="hidden text-white md:block">
        <strong>{user?.username}</strong>
      </span>
      <Button
        onClick={() => navigate("/settings")}
        aria-label="Settings"
        className="bg-grey hover:bg-lightGrey text-dark px-3 py-1 text-2xl transition-colors"
      >
        🛠
      </Button>
      <Button
        onClick={() => {
          logout();
        }}
        aria-label="Logout"
        className="bg-grey hover:bg-lightGrey text-dark px-3 py-1 text-2xl transition-colors"
      >
        🚪→
      </Button>
    </>
  );

  return (
    <header className="bg-primary border-accent flex items-center justify-between border-b-4 border-dashed p-4">
      <div className="flex items-center gap-4">
        <div className="xl:hidden">
          {navLinks.length && <MobileBurgerMenu navLinks={navLinks} />}
        </div>

        <h1
          onClick={() => navigate(titleLink)}
          className="font-gothic hover:text-lightestGrey text-shadow-hard-grey cursor-pointer text-5xl tracking-wide text-white transition-colors text-shadow-lg"
        >
          {title}
        </h1>

        {navLinks.length && <nav className="ml-24 hidden items-center gap-16 xl:flex">{desktopNavLinks}</nav>}
      </div>
      <div className="flex items-center gap-4 font-mono">
        {user && !isGuest ? (
          loggedInterface
        ) : (
          <Button
            onClick={() => navigate("/login", { state: { from: location } })}
            className="bg-grey hover:bg-accent/80 px-3 py-1 font-bold text-white transition-colors"
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
