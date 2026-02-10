import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Applications from "../Applications";
import { applicationList } from "../utils/constants";

describe("Applications Component", () => {
  it("renders all application links from the list", () => {
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>
    );
    applicationList.forEach((app) => {
      const link = screen.getByRole("link", { name: app.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", app.to);
    });
  });
});