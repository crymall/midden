const MiddenCard = ({ title, children, className = "" }) => {
  return (
    <div className={`min-h-screen w-full p-6 md:min-h-0 md:w-4/5 ${className}`}>
      {title && (
        <h2 className="mb-4 font-gothic text-4xl font-bold text-white">
          {title}
        </h2>
      )}
      <div className="text-lightestGrey font-mono">{children}</div>
    </div>
  );
};

export default MiddenCard;
