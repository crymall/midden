import { Link } from "react-router-dom";
import clsx from "clsx";

const AppCard = ({ to, symbol, label, small = false, description }) => {
  const isExternal = to.startsWith("http");
  const className = clsx(
    "relative group aspect-square text-white flex flex-col items-center hover:bg-opacity-90 transition-all hover:z-50",
    small ? "w-20 sm:w-36" : "w-20 sm:w-36 md:w-46",
  );

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
            small
              ? "text-xs sm:text-sm"
              : "text-xs sm:text-sm md:text-base",
          )}
        >
          {label}
        </span>
      </div>
      {description && (
        <div className="bg-lightGrey border-accent pointer-events-none absolute top-full left-0 z-50 w-[170%] -translate-x-4 border-4 border-dashed p-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <p className="text-md text-dark text-left font-mono">{description}</p>
        </div>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
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
    <Link to={to} className={className} aria-label={label}>
      {content}
    </Link>
  );
};

export default AppCard;
