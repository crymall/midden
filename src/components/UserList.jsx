import { Button, Select } from "@headlessui/react";
import useData from "../context/data/useData";
import useAuth from "../context/auth/useAuth";
import { ROLES } from "../constants/roles";

const UserList = () => {
  const { users, usersLoading, deleteUser, updateUserRole } = useData();
  const { user: currentUser } = useAuth();
  const roleOptions = Object.entries(ROLES).map(([key, value]) => ({
    value: String(value),
    label: String(key),
  }));

  if (usersLoading) {
    return (
      <div className="text-lavender p-4">Loading...</div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <p className="text-paleSlate p-4">No users found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-greyOlive/30">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Username</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-greyOlive/30">
        {users.map((user) => {
          const isCurrentUser = currentUser && currentUser.id === user.id;
          const isAdmin = user.role === "Admin";
          const isDisabled = isCurrentUser || isAdmin;

          return (
            <tr key={user.id} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-lavender">{user.id}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-lavender font-bold">{user.username}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <Select
                  className="bg-onyx border border-greyOlive text-lavender text-sm p-1 focus:outline-none focus:border-lavender w-full min-w-[100px]"
                  value={ROLES[user.role] ? String(ROLES[user.role]) : ""}
                  onChange={(e) => updateUserRole(user.id, Number(e.target.value))}
                  disabled={isDisabled}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <Button
                  className="bg-red-950 hover:bg-red-900 border border-red-800 px-2 py-1 text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDisabled}
                  aria-label="Delete User"
                  onClick={() => {
                    if (
                      confirm(`Are you sure you want to delete ${user.username}?`)
                    ) {
                      deleteUser(user.id);
                    }
                  }}
                >
                  ❌
                </Button>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
