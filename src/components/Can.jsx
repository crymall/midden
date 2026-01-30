import useAuth from "../context/auth/useAuth";

const Can = ({ perform, children }) => {
  const { user } = useAuth();

  if (!user) return null;

  const hasPermission = user.permissions.includes(perform);

  return hasPermission ? children : null;
};

export default Can;
