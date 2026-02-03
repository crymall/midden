import { Table, Badge, ActionIcon, Loader, Center, Text, Select } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import useData from "../context/data/useData";
import useAuth from "../context/auth/useAuth";
import Can from "./Can";
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
      <Center p="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Text c="dimmed" ta="center" mt="md">
        No users found.
      </Text>
    );
  }

  const rows = users.map((user) => {
    const isCurrentUser = currentUser && currentUser.id === user.id;
    const isAdmin = user.role === "Admin";
    const isDisabled = isCurrentUser || isAdmin;

    return (
      <Table.Tr key={user.id}>
        <Table.Td>{user.id}</Table.Td>
        <Table.Td>{user.username}</Table.Td>
        <Table.Td>
          <Can
            perform="write:users"
            not={
              <Badge
                color={
                  user.role === "Admin"
                    ? "red"
                    : user.role === "Editor"
                    ? "blue"
                    : "gray"
                }
              >
                {user.role}
              </Badge>
            }
          >
            <Select
              data={roleOptions}
              value={ROLES[user.role] ? String(ROLES[user.role]) : null}
              onChange={(val) => updateUserRole(user.id, Number(val))}
              allowDeselect={false}
              disabled={isDisabled}
            />
          </Can>
        </Table.Td>
        <Table.Td>
          <Can perform="write:users">
            <ActionIcon
              color="red"
              variant="subtle"
              disabled={isDisabled}
              onClick={() => {
                if (
                  confirm(`Are you sure you want to delete ${user.username}?`)
                ) {
                  deleteUser(user.id);
                }
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Can>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID</Table.Th>
          <Table.Th>Username</Table.Th>
          <Table.Th>Role</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default UserList;
