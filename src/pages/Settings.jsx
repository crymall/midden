import { useEffect } from "react";
import useAuth from "../context/auth/useAuth";
import useData from "../context/data/useData";
import UserList from "../components/UserList";
import Can from "../components/Can";

const Settings = () => {
  const { user } = useAuth();
  const { fetchUsers } = useData();

  useEffect(() => {
    if (user && user.permissions.includes("read:users")) {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  return (
    <Can perform="read:users">
      <UserList />
    </Can>
  );
};

export default Settings;