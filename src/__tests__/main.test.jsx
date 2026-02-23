import { describe, it, expect, vi, beforeEach } from "vitest";
import { StrictMode } from "react";
import App from "../App";

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

vi.mock("../App", () => ({
  default: () => <div>App Component</div>,
}));

vi.mock("../index.css", () => ({}));

describe("main.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup root element in DOM
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("renders App component into root element", async () => {
    // Reset modules to ensure main.jsx executes again
    vi.resetModules();
    
    await import("../main.jsx");

    const rootElement = document.getElementById("root");
    expect(createRootMock).toHaveBeenCalledWith(rootElement);
    expect(renderMock).toHaveBeenCalledWith(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
});