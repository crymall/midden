import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import AppCard from "../AppCard";

describe("AppCard Component", () => {
  const defaultProps = {
    to: "/internal",
    symbol: "🍎",
    label: "Apple",
  };

  it("renders an internal link correctly", () => {
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: /apple/i });
    expect(link).toHaveAttribute("href", "/internal");
    expect(screen.getByText("🍎")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders an external link correctly", () => {
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} to="https://example.com" />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: /apple/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies small styles when small prop is true", () => {
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} small={true} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("w-15");
    expect(link).not.toHaveClass("md:w-46");
  });

  it("renders description with correct visibility and default alignment", () => {
    const description = "banana";
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} description={description} />
      </MemoryRouter>
    );
    
    const descText = screen.getByText(description);
    expect(descText).toBeInTheDocument();

    const wrapper = descText.closest("div");
    expect(wrapper).toHaveClass("hidden");
    expect(wrapper).toHaveClass("sm:block");
    expect(wrapper).toHaveClass("left-0");
  });

  it("aligns description to the right when card is on the right side of screen", () => {
    const description = "banana";
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} description={description} />
      </MemoryRouter>
    );

    const card = screen.getByRole("link");
    // Mock getBoundingClientRect. JSDOM window.innerWidth defaults to 1024.
    card.getBoundingClientRect = vi.fn(() => ({ left: 600 }));

    fireEvent.mouseEnter(card);

    const wrapper = screen.getByText(description).closest("div");
    expect(wrapper).toHaveClass("right-0");
    expect(wrapper).toHaveClass("translate-x-4");
    expect(wrapper).not.toHaveClass("left-0");
  });

  it("renders initials and full label with responsive classes", () => {
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} label="Hello World" />
      </MemoryRouter>
    );

    expect(screen.getByText("HW")).toHaveClass("sm:hidden");
    expect(screen.getByText("Hello World")).toHaveClass("hidden sm:inline");
  });
});