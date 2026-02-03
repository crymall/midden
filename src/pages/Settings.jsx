import { useEffect } from "react";
import { Tabs, TextInput, Stack, Title, Paper, Group, Text, Button } from "@mantine/core";
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
    <Paper p={4}>
      <Group bg="#000080" p={2} justify="space-between" mb={2}>
        <Text c="white" fw="bold" size="sm" px={4}>
          Settings
        </Text>
        <Button size="xs" px={0} w={20} h={20}>
          X
        </Button>
      </Group>

      <Tabs defaultValue="profile">
        <Tabs.List mb={4}>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Can perform="read:users">
            <Tabs.Tab value="admin">Admin Panel</Tabs.Tab>
          </Can>
        </Tabs.List>

        <Paper variant="inset" p="md" minH={400}>
          <Tabs.Panel value="profile">
            <Title order={4} mb="md">User Information</Title>
            <Stack gap="md" maw={400}>
              <TextInput label="Username" value={user.username} readOnly />
              <TextInput label="Email" value={user.email || ''} readOnly />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="admin">
            <Can perform="read:users">
              <UserList />
            </Can>
          </Tabs.Panel>
        </Paper>
      </Tabs>
    </Paper>
  );
};

export default Settings;