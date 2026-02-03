import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell,
  Group,
  Button,
  Title,
  Text,
  Container,
  Tabs,
} from "@mantine/core";
import useAuth from "../context/auth/useAuth";
import useData from "../context/data/useData";
import UserList from "../components/UserList";
import Can from "../components/Can";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { fetchUsers } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.permissions.includes("read:users")) {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Title order={3}>IAM Dashboard</Title>
          </Group>
          <Group>
            <Text size="sm" visibleFrom="sm">
              Logged in as <strong>{user.username}</strong> ({user.role})
            </Text>
            <Button
              variant="light"
              color="red"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Tabs defaultValue="admin">
            <Tabs.List>
              <Can perform="read:users">
                <Tabs.Tab value="admin" color="red">
                  Admin Panel
                </Tabs.Tab>
              </Can>
            </Tabs.List>

            <Tabs.Panel value="admin">
              <UserList />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;
