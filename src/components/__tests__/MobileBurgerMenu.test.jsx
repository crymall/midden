import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MobileBurgerMenu from "../MobileBurgerMenu";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../gateways/Can", () => ({
  default: ({ perform, children }) => {
    return perform === "allowed" ? <>{children}</> : null;
  },
}));

describe("MobileBurgerMenu Component", () => {
  const defaultProps = {
    showBack: false,
    navLinks: [],
  };

  it("renders the burger button initially", () => {
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText("≡")).toBeInTheDocument();
    expect(screen.queryByText("X")).not.toBeInTheDocument();
  });

  it("opens the menu when burger button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    expect(await screen.findByText("X")).toBeInTheDocument();
  });

  it("closes the menu when X button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    const closeBtn = await screen.findByText("X");
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("X")).not.toBeInTheDocument();
    });
  });

  it("renders navigation links", async () => {
    const navLinks = [
      { to: "/test", label: "Test Link", ariaLabel: "Test" },
    ];
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} navLinks={navLinks} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    expect(await screen.findByText("Test Link")).toBeInTheDocument();
  });

  it("renders restricted link when permission is allowed", async () => {
    const navLinks = [
      { to: "/restricted", label: "Restricted Link", requiredPermission: "allowed" },
    ];
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} navLinks={navLinks} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    expect(await screen.findByText("Restricted Link")).toBeInTheDocument();
  });

  it("does not render restricted link when permission is denied", async () => {
    const navLinks = [
      { to: "/restricted", label: "Restricted Link", requiredPermission: "denied" },
    ];
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} navLinks={navLinks} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    expect(await screen.findByText("X")).toBeInTheDocument();
    expect(screen.queryByText("Restricted Link")).not.toBeInTheDocument();
  });

  it("renders 'Back to Midden' button when showBack is true and navigates on click", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} showBack={true} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    const backBtn = await screen.findByText("Back to Midden");
    expect(backBtn).toBeInTheDocument();

    await user.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/");
    
    await waitFor(() => {
      expect(screen.queryByText("X")).not.toBeInTheDocument();
    });
  });

  it("does not render 'Back to Midden' when showBack is false", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileBurgerMenu {...defaultProps} showBack={false} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("≡"));
    expect(screen.queryByText("Back to Midden")).not.toBeInTheDocument();
  });
});