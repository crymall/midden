import { useState } from "react";
import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import Can from "./gateways/Can";

const MobileBurgerMenu = ({ showBack, navLinks }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
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
            {navLinks.map((link) =>
              link.requiredPermission ? (
                <Can key={link.to} perform={link.requiredPermission}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label={link.ariaLabel}
                    className="font-gothic text-4xl text-white hover:text-lightestGrey transition-colors"
                  >
                    {link.label}
                  </Link>
                </Can>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={link.ariaLabel}
                  className="font-gothic text-4xl text-white hover:text-lightestGrey transition-colors"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default MobileBurgerMenu;