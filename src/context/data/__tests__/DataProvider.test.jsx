import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContext } from "react";
import { DataProvider } from "../DataProvider";
import DataContext from "../DataContext";
import * as iamApi from "../../../services/iamApi";

// Mock the dependencies
vi.mock("../../../services/iamApi");
vi.mock("../../../utils/constants", () => ({
  ROLES: {
    ADMIN: "role_admin_id",
    USER: "role_user_id",
  },
}));

describe("DataProvider", () => {
  const mockUsers = [
    { id: "1", name: "User One", role: "USER" },
    { id: "2", name: "User Two", role: "USER" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides initial state", () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    expect(result.current.usersLoading).toBe(false);
    expect(result.current.users).toEqual([]);
  });

  it("fetches users and updates state", async () => {
    iamApi.fetchUsers.mockResolvedValue({ users: mockUsers });
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    let promise;
    act(() => {
      promise = result.current.fetchUsers();
    });

    expect(result.current.usersLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.usersLoading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
    expect(iamApi.fetchUsers).toHaveBeenCalledTimes(1);
  });

  it("handles fetch error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    iamApi.fetchUsers.mockRejectedValue(new Error("Fetch failed"));
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(result.current.usersLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Fetch users failed",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it("deletes a user and updates state", async () => {
    iamApi.fetchUsers.mockResolvedValue({ users: mockUsers });
    iamApi.deleteUser.mockResolvedValue({});
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    // Load users
    await act(async () => {
      await result.current.fetchUsers();
    });

    // Delete User One
    await act(async () => {
      await result.current.deleteUser("1");
    });

    expect(iamApi.deleteUser).toHaveBeenCalledWith("1");
    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].id).toBe("2");
  });

  it("updates user role and updates state", async () => {
    iamApi.fetchUsers.mockResolvedValue({ users: mockUsers });
    iamApi.updateUserRole.mockResolvedValue({});
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;
    const { result } = renderHook(() => useContext(DataContext), { wrapper });

    // Load users
    await act(async () => {
      await result.current.fetchUsers();
    });

    // Promote User One
    await act(async () => {
      await result.current.updateUserRole("1", "role_admin_id");
    });

    expect(iamApi.updateUserRole).toHaveBeenCalledWith("1", "role_admin_id");
    expect(result.current.users.find((u) => u.id === "1").role).toBe("ADMIN");
  });
});