import { Outlet } from "react-router-dom";
import {
  AppShell,
  Container,
} from "@mantine/core";
import useAuth from "../context/auth/useAuth";
import Header from "../components/Header";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header user={user} logout={logout} />

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;
