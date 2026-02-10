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
import Can from "../components/gateways/Can";
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
        <TabList className="border-greyOlive mb-6 flex space-x-4 border-b">
          <Tab className="data-selected:border-lavender data-selected:text-lavender text-greyOlive hover:text-paleSlate cursor-pointer px-4 py-2 text-sm font-bold transition-colors focus:outline-none data-selected:border-b-2">
            Profile
          </Tab>
          <Can perform="read:users">
            <Tab className="data-selected:border-lavender data-selected:text-lavender text-greyOlive hover:text-paleSlate cursor-pointer px-4 py-2 text-sm font-bold transition-colors focus:outline-none data-selected:border-b-2">
              Admin Panel
            </Tab>
          </Can>
        </TabList>

        <TabPanels>
          <TabPanel>
            <h2 className="mb-4 font-serif text-xl font-bold text-white">
              User Information
            </h2>
            <div className="max-w-md space-y-4">
              <Field>
                <Label className="text-lavender mb-1 block text-sm font-bold">
                  Username
                </Label>
                <Input
                  value={user.username}
                  readOnly
                  className="bg-onyx border-greyOlive text-lavender focus:border-lavender w-full border p-2 focus:outline-none"
                />
              </Field>
              <Field>
                <Label className="text-lavender mb-1 block text-sm font-bold">
                  Email
                </Label>
                <Input
                  value={user.email || ""}
                  readOnly
                  className="bg-onyx border-greyOlive text-lavender focus:border-lavender w-full border p-2 focus:outline-none"
                />
              </Field>
            </div>
          </TabPanel>

          <Can perform="read:users">
            <TabPanel>
              <h2 className="mb-4 font-serif text-xl font-bold text-white">
                User Admin
              </h2>
              <UserList />
            </TabPanel>
          </Can>
        </TabPanels>
      </TabGroup>
    </MiddenCard>
  );
};

export default Settings;
