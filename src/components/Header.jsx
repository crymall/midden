import { AppShell, Group, Title, Text, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const Header = ({ user, logout }) => {
  const navigate = useNavigate();

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Title
            order={3}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Midden
          </Title>
        </Group>
        <Group>
          <Text size="sm" visibleFrom="sm">
            Logged in as <strong>{user.username}</strong> ({user.role})
          </Text>
          <Button variant="light" onClick={() => navigate("/dashboard/settings")}>
            Settings
          </Button>
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
  );
};

export default Header;