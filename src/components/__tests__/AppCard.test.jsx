import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
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

  it("renders description when provided", () => {
    const description = "banana";
    render(
      <MemoryRouter>
        <AppCard {...defaultProps} description={description} />
      </MemoryRouter>
    );
    
    expect(screen.getByText(description)).toBeInTheDocument();
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