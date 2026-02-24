import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyLists from "../MyLists";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

// eslint-disable-next-line no-undef
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("MyLists", () => {
  const mockGetUserLists = vi.fn();
  const mockDeleteList = vi.fn();
  const mockCreateList = vi.fn();

  const mockCanteenApi = {
    deleteList: mockDeleteList,
    createList: mockCreateList,
  };

  const defaultUser = { id: "user1" };
  const defaultLists = [
    { id: "l1", name: "Favorites" },
    { id: "l2", name: "Weekly" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: defaultUser });
    useData.mockReturnValue({
      userLists: defaultLists,
      getUserLists: mockGetUserLists.mockResolvedValue([]),
      canteenApi: mockCanteenApi,
    });
  });

  it("renders lists", async () => {
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText("Favorites")).toBeInTheDocument());
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  it("opens delete modal and deletes list", async () => {
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Weekly")).toBeInTheDocument());

    // Find delete button for "Weekly" (Favorites doesn't have one)
    const deleteBtn = screen.getByLabelText("Delete Weekly");
    fireEvent.click(deleteBtn);

    // Check modal
    expect(screen.getByText("Delete List")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this list/)).toBeInTheDocument();

    // Confirm
    const confirmBtn = screen.getByText("Delete");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteList).toHaveBeenCalledWith("l2");
      expect(mockGetUserLists).toHaveBeenCalled();
    });
  });

  it("opens create modal and creates list", async () => {
    render(
      <MemoryRouter>
        <MyLists />
      </MemoryRouter>
    );

    const createBtn = screen.getByText("+");
    fireEvent.click(createBtn);

    expect(screen.getByText("Create New List")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("e.g. Weeknight Dinners");
    fireEvent.change(input, { target: { value: "New List" } });

    const submitBtn = screen.getByText("Create List");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith("New List");
      expect(mockGetUserLists).toHaveBeenCalled();
    });
  });
});