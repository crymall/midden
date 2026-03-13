import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Conversation from "../Conversation";
import useData from "../../../context/data/useData";
import useAuth from "../../../context/auth/useAuth";

// Mock hooks
vi.mock("../../../context/data/useData");
vi.mock("../../../context/auth/useAuth");

vi.mock("../../../components/MiddenCard", () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe("Conversation", () => {
  const mockGetConversation = vi.fn();
  const mockSendMessage = vi.fn();
  const mockFetchUser = vi.fn();

  const defaultUser = { id: "1", username: "TestUser" };
  const mockConversation = [
    {
      id: 1,
      sender_id: "2",
      content: "Hello",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      sender_id: "1",
      content: "Hi back",
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: defaultUser });
    useData.mockReturnValue({
      currentConversation: mockConversation,
      getConversation: mockGetConversation,
      sendMessage: mockSendMessage,
      messagesLoading: false,
      canteenApi: { fetchUser: mockFetchUser },
    });
    mockFetchUser.mockResolvedValue({ id: "2", username: "Friend1" });

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/messages/2"]}>
        <Routes>
          <Route path="/messages/:id" element={<Conversation />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders conversation", async () => {
    renderComponent();
    expect(mockGetConversation).toHaveBeenCalledWith("2");
    expect(mockFetchUser).toHaveBeenCalledWith("2");
    await waitFor(() => expect(screen.getByText("Friend1")).toBeInTheDocument());
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi back")).toBeInTheDocument();
  });

  it("sends a message", async () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "New message" } });
    
    const sendButton = screen.getByText("Send");
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockSendMessage).toHaveBeenCalledWith("2", "New message");
    expect(input.value).toBe("");
  });

  it("shows loading state", () => {
    useData.mockReturnValue({
      ...useData(),
      messagesLoading: true,
    });
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});