import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Dialog, DialogPanel, Field, Label, Input, Select } from "@headlessui/react";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";

const MyLists = () => {
  const { user } = useAuth();
  const { userLists, getUserLists, canteenApi } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newList, setNewList] = useState({ name: "" });
  const [creatingList, setCreatingList] = useState(false);
  const [fetchingLists, setFetchingLists] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (user) {
      setFetchingLists(true);
      getUserLists(user.id, limit, (page - 1) * limit).then(() => setFetchingLists(false));
    }
  }, [user, getUserLists, page, limit]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    setCreatingList(true);
    try {
      await canteenApi.createList(newList.name);
      await getUserLists(user.id, limit, (page - 1) * limit);
      setIsCreateModalOpen(false);
      setNewList({ name: "" });
    } catch (error) {
      console.error("Failed to create list", error);
    } finally {
      setCreatingList(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const baseInputClass = "bg-dark border-grey text-lightestGrey focus:border-lightestGrey border p-2 focus:outline-none w-full";

  return (
    <MiddenCard title="My Lists">
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-accent hover:bg-accent/80 px-4 py-2 font-bold text-white transition-colors"
        >
          + Create New List
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fetchingLists ? (
          <div className="col-span-full flex justify-center p-12">
            <p className="text-lightestGrey animate-pulse font-mono text-xl">
              Loading lists...
            </p>
          </div>
        ) : userLists.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center border-2 border-dashed border-grey p-12 text-center">
            <p className="text-lightGrey font-mono">You haven't created any lists yet.</p>
          </div>
        ) : (
          [
            ...userLists.filter((l) => l.name === "Favorites"),
            ...userLists.filter((l) => l.name !== "Favorites"),
          ].map((list) => (
            <Link
              key={list.id}
              to={`/applications/canteen/my-lists/${list.id}`}
              className="group border-grey hover:border-accent flex flex-col border-2 border-dashed p-4 transition-colors"
            >
              <h3 className="text-accent group-hover:text-white font-mono text-xl font-bold transition-colors">
                {list.name}
              </h3>
            </Link>
          ))
        )}
      </div>

      <div className="border-grey mt-6 flex flex-col items-center justify-between gap-4 border-t-2 pt-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <label className="text-lightestGrey text-sm font-bold">
            Rows per page:
          </label>
          <Select
            value={limit}
            onChange={handleLimitChange}
            className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey border p-1 focus:outline-none"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            disabled={page === 1 || fetchingLists}
            onClick={() => handlePageChange(page - 1)}
            className="hover:text-lightestGrey text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Prev
          </Button>
          <span className="text-lightestGrey font-mono">Page {page}</span>
          <Button
            disabled={userLists.length < limit || fetchingLists}
            onClick={() => handlePageChange(page + 1)}
            className="hover:text-lightestGrey text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Create List Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-dark border-accent w-full max-w-md border-2 border-dashed p-6 shadow-xl">
            <h3 className="font-gothic mb-4 text-3xl text-white">Create New List</h3>
            <form onSubmit={handleCreateList} className="flex flex-col gap-4">
              <Field>
                <Label className="text-lightestGrey mb-1 block text-sm font-bold">
                  List Name
                </Label>
                <Input
                  required
                  value={newList.name}
                  onChange={(e) =>
                    setNewList({ ...newList, name: e.target.value })
                  }
                  className={baseInputClass}
                  placeholder="e.g. Weeknight Dinners"
                />
              </Field>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-lightGrey px-4 py-2 font-bold hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingList}
                  className="bg-accent hover:bg-accent/80 px-4 py-2 font-bold text-white disabled:opacity-50"
                >
                  {creatingList ? "Creating..." : "Create List"}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </MiddenCard>
  );
};

export default MyLists;