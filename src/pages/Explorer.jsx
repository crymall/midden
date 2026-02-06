import { Link } from "react-router-dom";
import MiddenCard from "../components/MiddenCard";

const Explorer = () => {
  const items = [
    {
      label: "Applications",
      symbol: "💻",
      to: "/applications",
    },
    {
      label: "Experiments",
      symbol: "🧪",
      to: "/experiments",
    }
  ];

  return (
    <MiddenCard>
      <div className="flex flex-wrap gap-6 w-full">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="w-36 sm:w-56 md:w-64 aspect-square text-white flex flex-col items-center justify-center gap-4 hover:bg-opacity-90 transition-all"
            aria-label={item.label}
          >
            <span className="text-3xl sm:text-5xl md:text-6xl">{item.symbol}</span>
            <span className="text-md sm:text-3xl md:text-4xl sm:font-gothic tracking-wider">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </MiddenCard>
  );
};

export default Explorer;
