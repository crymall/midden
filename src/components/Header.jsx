import { useState } from "react";
import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { useNavigate, Link } from "react-router-dom";

const Header = ({ user, logout, title, titleLink, navLinks }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isGuest = user && user.username === "guest";
  const showBack = title !== "Midden";
  const hasNav = navLinks.length > 0;

  return (
    <header className="bg-primary border-accent flex items-center justify-between border-b-4 border-dashed p-4">
      <div className="flex items-center gap-4">
        {/* Mobile: Burger Menu (if links exist) or Back Button */}
        <div className="md:hidden">
          {hasNav ? (
            <>
              <Button
                onClick={() => setMobileMenuOpen(true)}
                className="hover:text-lightestGrey text-shadow-hard-grey font-mono text-2xl font-bold text-white transition-colors"
              >
                ≡
              </Button>
              <Dialog
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                className="relative z-50"
              >
                <DialogPanel className="fixed inset-0 flex flex-col items-center justify-center bg-black p-4">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-4 right-4 font-mono text-4xl text-white hover:text-lightestGrey"
                  >
                    X
                  </button>
                  <div className="flex flex-col items-center gap-8">
                    {showBack && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/");
                        }}
                        className="font-gothic text-4xl text-white hover:text-lightestGrey transition-colors"
                      >
                        Back to Midden
                      </button>
                    )}
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label={link.ariaLabel}
                        className="font-gothic text-4xl text-white hover:text-lightestGrey transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </DialogPanel>
              </Dialog>
            </>
          ) : (
            showBack && (
              <Button
                onClick={() => navigate("/")}
                className="hover:text-lightestGrey text-shadow-hard-grey font-mono text-2xl font-bold text-white transition-colors"
              >
                ←
              </Button>
            )
          )}
        </div>

        {/* Desktop: Back Button */}
        {showBack && (
          <div className="hidden md:block">
            <Button
              onClick={() => navigate("/")}
              className="hover:text-lightestGrey text-shadow-hard-grey font-mono text-2xl font-bold text-white transition-colors"
            >
              ←
            </Button>
          </div>
        )}

        <h1
          onClick={() => navigate(titleLink)}
          className="font-gothic hover:text-lightestGrey text-shadow-hard-grey cursor-pointer text-5xl tracking-wide text-white transition-colors text-shadow-lg"
        >
          {title}
        </h1>

        {/* Desktop: Nav Links */}
        {hasNav && (
          <nav className="hidden md:flex items-center gap-6 ml-24">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-label={link.ariaLabel}
                className="font-mono text-xl text-white hover:text-lightestGrey transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-4 font-mono">
        <span className="text-white hidden md:block">
          <strong>{user.username}</strong>
        </span>
        {!isGuest && (
          <Button
            onClick={() => navigate("/settings")}
            aria-label="Settings"
            className="bg-grey hover:bg-lightGrey text-dark px-3 py-1 text-2xl transition-colors"
          >
            🛠
          </Button>
        )}
        <Button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          aria-label="Logout"
          className="bg-grey hover:bg-lightGrey text-dark px-3 py-1 text-2xl transition-colors"
        >
          🚪→
        </Button>
      </div>
    </header>
  );
};

export default Header;
