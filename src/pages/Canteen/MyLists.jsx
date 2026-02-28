import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Field, Label, Input } from "@headlessui/react";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";
import MiddenModal from "../../components/MiddenModal";
import ListList from "../../components/canteen/ListList";
import PaginationControls from "../../components/PaginationControls";

const MyLists = () => {
  const { user } = useAuth();
  const { userLists, getUserLists, canteenApi } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newList, setNewList] = useState({ name: "" });
  const [creatingList, setCreatingList] = useState(false);
  const [fetchingLists, setFetchingLists] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [listToDelete, setListToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      setFetchingLists(true);
      getUserLists(user.id, limit, (page - 1) * limit).then(() =>
        setFetchingLists(false),
      );
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

  const handleDeleteList = (e, listId) => {
    e.preventDefault();
    e.stopPropagation();
    setListToDelete(listId);
  };

  const confirmDeleteList = async () => {
    try {
      await canteenApi.deleteList(listToDelete);
      await getUserLists(user.id, limit, (page - 1) * limit);
      setListToDelete(null);
    } catch (error) {
      console.error("Failed to delete list", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const baseInputClass =
    "bg-dark border-grey text-lightestGrey focus:border-lightestGrey border p-2 focus:outline-none w-full";

  return (
    <MiddenCard>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-gothic text-4xl font-bold text-white">My Lists</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-accent hover:bg-accent/80 px-4 py-2 font-bold text-white transition-colors"
        >
          +
        </Button>
      </div>

      <ListList
        fetchingLists={fetchingLists}
        userLists={userLists}
        handleDeleteList={handleDeleteList}
        emptyMessage="You haven't created any lists yet."
      />

      <PaginationControls
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={fetchingLists}
        isNextDisabled={userLists.length < limit}
      />

      {/* Create List Modal */}
      <MiddenModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New List"
      >
        <form onSubmit={handleCreateList} className="flex flex-col gap-4">
          <Field>
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              List Name
            </Label>
            <Input
              required
              value={newList.name}
              onChange={(e) => setNewList({ ...newList, name: e.target.value })}
              className={baseInputClass}
              placeholder="e.g. Weeknight Dinners"
              autoFocus
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
      </MiddenModal>

      {/* Delete List Modal */}
      <MiddenModal
        isOpen={!!listToDelete}
        onClose={() => setListToDelete(null)}
        title="Delete List"
      >
        <p className="text-lightestGrey mb-6 font-mono">
          Are you sure you want to delete this list? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => setListToDelete(null)}
            className="text-lightGrey px-4 py-2 font-bold hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteList}
            className="bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
          >
            Delete
          </Button>
        </div>
      </MiddenModal>
    </MiddenCard>
  );
};

export default MyLists;
