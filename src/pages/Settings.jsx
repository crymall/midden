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
import { PERMISSIONS } from "../utils/constants";

const Settings = () => {
  const { user } = useAuth();
  const { fetchUsers } = useData();
  const { readUsers } = PERMISSIONS;


  useEffect(() => {
    if (user && user.permissions.includes(readUsers)) {
      fetchUsers();
    }
  }, [fetchUsers, user, readUsers]);

  return (
    <MiddenCard>
      <h2 className="mb-4 font-gothic text-4xl font-bold text-white">
        Settings
      </h2>
      <TabGroup>
        <TabList className="border-grey mb-6 flex space-x-4 border-b">
          <Tab className="data-selected:border-lightestGrey data-selected:text-lightestGrey text-grey hover:text-lightGrey cursor-pointer px-4 py-2 text-sm font-bold transition-colors focus:outline-none data-selected:border-b-2">
            Profile
          </Tab>
          <Can perform={readUsers}>
            <Tab className="data-selected:border-lightestGrey data-selected:text-lightestGrey text-grey hover:text-lightGrey cursor-pointer px-4 py-2 text-sm font-bold transition-colors focus:outline-none data-selected:border-b-2">
              Admin Panel
            </Tab>
          </Can>
        </TabList>

        <TabPanels>
          <TabPanel>
            <h2 className="mb-4 font-mono text-xl font-bold text-white">
              User Information
            </h2>
            <div className="max-w-md space-y-4">
              <Field>
                <Label className="text-lightestGrey mb-1 block text-sm font-bold">
                  Username
                </Label>
                <Input
                  value={user.username}
                  readOnly
                  className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey w-full border p-2 focus:outline-none"
                />
              </Field>
              <Field>
                <Label className="text-lightestGrey mb-1 block text-sm font-bold">
                  Email
                </Label>
                <Input
                  value={user.email || ""}
                  readOnly
                  className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey w-full border p-2 focus:outline-none"
                />
              </Field>
            </div>
          </TabPanel>

          <Can perform={readUsers}>
            <TabPanel>
              <h2 className="mb-4 font-mono text-xl font-bold text-white">
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
