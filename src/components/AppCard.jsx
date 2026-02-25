import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

const AppCard = ({ to, symbol, label, small = false, description }) => {
  const [alignRight, setAlignRight] = useState(false);
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setAlignRight(rect.left > window.innerWidth / 2);
    }
  };

  const isExternal = to.startsWith("http");
  const className = clsx(
    "relative group aspect-square text-white flex flex-col items-center hover:bg-opacity-90 transition-all hover:z-50",
    small ? "w-15 sm:w-36" : "w-15 sm:w-36 md:w-46",
  );
  const initials =
    label === "Back"
      ? ""
      : label
          .split(" ")
          .map((word) => word[0])
          .join("");

  const content = (
    <>
      <div className="flex flex-1 items-end justify-center pb-1">
        <span
          className={small ? "text-3xl" : "text-3xl sm:text-4xl md:text-5xl"}
        >
          {symbol}
        </span>
      </div>
      <div className="flex flex-1 items-start justify-center px-2 pt-2">
        <span
          className={clsx(
            "text-center leading-tight tracking-wider",
            small ? "text-xs sm:text-sm" : "text-xs sm:text-sm md:text-base",
          )}
        >
          <span className="sm:hidden">{initials}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
      </div>
      {description && (
        <div
          className={clsx(
            "bg-lightGrey border-accent pointer-events-none absolute top-full z-50 hidden w-[170%] border-4 border-dashed p-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block md:-mt-4",
            alignRight ? "right-0 translate-x-4" : "left-0 -translate-x-4",
          )}
        >
          <p className="md:text-base text-dark text-left font-mono text-sm">
            {description}
          </p>
        </div>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        href={to}
        className={className}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      to={to}
      className={className}
      aria-label={label}
    >
      {content}
    </Link>
  );
};

export default AppCard;
