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

vi.mock("../../../components/canteen/RecipeCard", () => ({
  default: ({ recipe, inverse }) => (
    <div data-testid="recipe-card" data-inverse={String(inverse)}>{recipe.title}</div>
  ),
}));

describe("Conversation", () => {
  const mockGetConversation = vi.fn();
  const mockSendMessage = vi.fn();
  const mockFetchUser = vi.fn();
  const mockMarkMessagesAsRead = vi.fn();

  const defaultUser = { id: "1", username: "TestUser" };
  const mockConversation = [
    {
      id: 1,
      sender_id: "2",
      receiver_id: "1",
      content: "Hello",
      created_at: "2023-01-01T10:00:00.000Z",
      is_read: false,
    },
    {
      id: 2,
      sender_id: "1",
      receiver_id: "2",
      content: "Hi back",
      created_at: "2023-01-01T10:05:00.000Z",
      is_read: true,
      recipe: {
        id: "100",
        title: "Test Recipe",
        description: "Test Description",
        tags: [],
        likes: [],
      },
      recipe_id: "100",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: defaultUser });
    useData.mockReturnValue({
      currentConversation: mockConversation,
      getConversation: mockGetConversation,
      sendMessage: mockSendMessage,
      markMessagesAsRead: mockMarkMessagesAsRead,
      messagesLoading: false,
      canteenApi: { fetchUser: mockFetchUser },
    });
    mockFetchUser.mockResolvedValue({ id: "2", username: "Friend1" });

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const renderComponent = async () => {
    render(
      <MemoryRouter initialEntries={["/messages/2"]}>
        <Routes>
          <Route path="/messages/:id" element={<Conversation />} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByText("Friend1");
  };

  it("renders conversation", async () => {
    await renderComponent();
    expect(mockGetConversation).toHaveBeenCalledWith("2");
    expect(mockFetchUser).toHaveBeenCalledWith("2");
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi back")).toBeInTheDocument();
    const recipeCard = screen.getByTestId("recipe-card");
    expect(recipeCard).toHaveTextContent("Test Recipe");
    expect(recipeCard).toHaveAttribute("data-inverse", "true");
  });

  it("sends a message", async () => {
    await renderComponent();
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "New message" } });
    
    const sendButton = screen.getByText("Send");
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockSendMessage).toHaveBeenCalledWith("2", "New message");
    expect(input.value).toBe("");
  });

  it("shows loading state", async () => {
    useData.mockReturnValue({
      ...useData(),
      messagesLoading: true,
    });
    await renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("marks unread messages sent to the user as read", async () => {
    await renderComponent();
    await waitFor(() => {
      expect(mockMarkMessagesAsRead).toHaveBeenCalledWith([1]);
    });
  });

  it("sends a message via Enter key", async () => {
    await renderComponent();
    const input = screen.getByPlaceholderText("Type a message...");
    
    await act(async () => {
      fireEvent.change(input, { target: { value: "Enter message" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: false });
    });

    expect(mockSendMessage).toHaveBeenCalledWith("2", "Enter message");
  });

  it("does not send a message via Shift+Enter", async () => {
    await renderComponent();
    const input = screen.getByPlaceholderText("Type a message...");
    
    await act(async () => {
      fireEvent.change(input, { target: { value: "Multiline\nmessage" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("disables the send button when the message is empty", async () => {
    await renderComponent();
    const sendButton = screen.getByText("Send");
    expect(sendButton).toBeDisabled();
  });

  it("formats dates correctly", async () => {
    await renderComponent();
    const date1 = new Date("2023-01-01T10:00:00.000Z");
    const formattedStr = date1.toLocaleDateString() + " " + date1.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await waitFor(() => expect(screen.getAllByText(formattedStr).length).toBeGreaterThan(0));
  });

  it("logs error if sending message fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSendMessage.mockRejectedValue(new Error("Send failed"));
    
    await renderComponent();
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Failing message" } });
    
    const sendButton = screen.getByText("Send");
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to send message", expect.any(Error));
    consoleSpy.mockRestore();
  });
});