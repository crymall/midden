import { useEffect } from "react";
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Field,
  Label,
  Input,
} from "@headlessui/react";
import useAuth from "../context/auth/useAuth";
import useData from "../context/data/useData";
import UserList from "../components/UserList";
import Can from "../components/Can";
import MiddenCard from "../components/MiddenCard";

const Settings = () => {
  const { user } = useAuth();
  const { fetchUsers } = useData();

  useEffect(() => {
    if (user && user.permissions.includes("read:users")) {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  return (
    <MiddenCard title="Settings">
      <TabGroup>
        <TabList className="flex space-x-4 border-b border-greyOlive mb-6">
          <Tab className="px-4 py-2 text-sm font-bold focus:outline-none data-[selected]:border-b-2 data-[selected]:border-lavender data-[selected]:text-lavender text-greyOlive hover:text-paleSlate transition-colors cursor-pointer">
            Profile
          </Tab>
          <Can perform="read:users">
            <Tab className="px-4 py-2 text-sm font-bold focus:outline-none data-[selected]:border-b-2 data-[selected]:border-lavender data-[selected]:text-lavender text-greyOlive hover:text-paleSlate transition-colors cursor-pointer">
              Admin Panel
            </Tab>
          </Can>
        </TabList>

        <TabPanels>
          <TabPanel>
            <h2 className="text-xl font-serif font-bold mb-4 text-white">User Information</h2>
            <div className="space-y-4 max-w-md">
              <Field>
                <Label className="block text-sm font-bold mb-1 text-lavender">Username</Label>
                <Input
                  value={user.username}
                  readOnly
                  className="w-full bg-onyx border border-greyOlive text-lavender p-2 focus:outline-none focus:border-lavender"
                />
              </Field>
              <Field>
                <Label className="block text-sm font-bold mb-1 text-lavender">Email</Label>
                <Input
                  value={user.email || ""}
                  readOnly
                  className="w-full bg-onyx border border-greyOlive text-lavender p-2 focus:outline-none focus:border-lavender"
                />
              </Field>
            </div>
          </TabPanel>

          <Can perform="read:users">
            <TabPanel>
              <h2 className="text-xl font-serif font-bold mb-4 text-white">User Admin</h2>
              <UserList />
            </TabPanel>
          </Can>
        </TabPanels>
      </TabGroup>
    </MiddenCard>
  );
};

export default Settings;
