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
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useAuth from "../context/auth/useAuth";
import useData from "../context/data/useData";
import DocumentList from "../components/DocumentList";
import UserList from "../components/UserList";
import CreateDocumentForm from "../components/CreateDocumentForm";
import Can from "../components/Can";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { fetchDocuments, fetchUsers } = useData();
  const navigate = useNavigate();
  const [modalOpen, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetchDocuments();
    if (user.permissions.includes("read:users")) {
      fetchUsers();
    }
  }, [fetchDocuments, fetchUsers, user]);

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
          <Tabs defaultValue="documents">
            <Tabs.List mb="md">
              <Tabs.Tab value="documents">Confidential Documents</Tabs.Tab>
              <Can perform="read:users">
                <Tabs.Tab value="admin" color="red">
                  Admin Panel
                </Tabs.Tab>
              </Can>
            </Tabs.List>

            <Tabs.Panel value="documents">
              <Group justify="space-between" mb="lg">
                <Title order={4}>Files</Title>
                <Can perform="write:documents">
                  <Button onClick={open}>+ New Document</Button>
                </Can>
              </Group>
              <DocumentList />
            </Tabs.Panel>

            <Tabs.Panel value="admin">
              <UserList />
            </Tabs.Panel>
          </Tabs>
        </Container>

        <Modal opened={modalOpen} onClose={close} title="Create New Document">
          <CreateDocumentForm onSuccess={close} />
        </Modal>
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;
