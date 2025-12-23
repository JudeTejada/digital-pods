import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WidgetsProviderRoot } from "@/hooks";
import { api } from "@/lib/api";
import type { Widget } from "@/types";
import { WidgetList } from "../WidgetList";

// Mock the API module
vi.mock("@/lib/api");

const renderWithProvider = (component: React.ReactNode) => {
  return render(<WidgetsProviderRoot>{component}</WidgetsProviderRoot>);
};

describe("WidgetList", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress expected console.error output from error-handling tests
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders 'My Pod' title and 'Add Widget' button", async () => {
    vi.mocked(api).getWidgets.mockResolvedValue([]);

    renderWithProvider(<WidgetList />);

    // Wait for component to finish loading and render main content
    await waitFor(
      () => {
        expect(screen.getByText("My Pod")).toBeDefined();
      },
      { timeout: 3000 },
    );
    expect(screen.getByRole("button", { name: /add widget/i })).toBeDefined();
  });

  it("fetches widgets on mount", async () => {
    const mockWidgets: Widget[] = [
      { id: "1", text: "First widget" },
      { id: "2", text: "Second widget" },
    ];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      expect(vi.mocked(api).getWidgets).toHaveBeenCalledTimes(1);
    });
  });

  it("renders fetched widgets", async () => {
    const mockWidgets: Widget[] = [
      { id: "1", text: "First widget" },
      { id: "2", text: "Second widget" },
    ];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
      expect((textareas[0] as HTMLTextAreaElement).value).toBe("First widget");
      expect((textareas[1] as HTMLTextAreaElement).value).toBe("Second widget");
    });
  });

  it("shows empty state when no widgets exist", async () => {
    vi.mocked(api).getWidgets.mockResolvedValue([]);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      expect(screen.getByText(/no widgets yet/i)).toBeDefined();
    });
  });

  it("adds a new widget when 'Add Widget' button is clicked", async () => {
    vi.mocked(api).getWidgets.mockResolvedValue([]);
    vi.mocked(api).saveWidget.mockResolvedValue(undefined);

    renderWithProvider(<WidgetList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/no widgets yet/i)).toBeDefined();
    });

    const addButton = screen.getByRole("button", { name: /add widget/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(vi.mocked(api).saveWidget).toHaveBeenCalledTimes(1);
    });

    const savedWidget = vi.mocked(api).saveWidget.mock.calls[0][0];
    expect(savedWidget).toHaveProperty("id");
    expect(savedWidget.text).toBe("");
  });

  it("displays loading state initially", () => {
    vi.mocked(api).getWidgets.mockImplementation(() => new Promise(() => {}));

    renderWithProvider(<WidgetList />);

    expect(screen.getByText("Loading widgets...")).toBeDefined();
  });

  it("updates widget on textarea blur", async () => {
    const mockWidgets: Widget[] = [{ id: "1", text: "Initial text" }];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);
    vi.mocked(api).saveWidget.mockResolvedValue(undefined);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Initial text");
    });

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Updated text" } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(vi.mocked(api).saveWidget).toHaveBeenCalledWith({
        id: "1",
        text: "Updated text",
      });
    });
  });

  it("deletes widget when delete button is clicked", async () => {
    const mockWidgets: Widget[] = [{ id: "1", text: "To delete" }];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);
    vi.mocked(api).deleteWidget.mockResolvedValue(undefined);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
        "To delete",
      );
    });

    const deleteButton = screen.getByTitle("Delete widget");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(vi.mocked(api).deleteWidget).toHaveBeenCalledWith("1");
    });

    // Widget should be removed from UI
    await waitFor(() => {
      expect(screen.queryByRole("textbox")).toBeNull();
    });
  });

  it("maintains independent state for multiple widgets", async () => {
    const mockWidgets: Widget[] = [
      { id: "1", text: "Widget 1" },
      { id: "2", text: "Widget 2" },
    ];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);
    vi.mocked(api).saveWidget.mockResolvedValue(undefined);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    const textareas = screen.getAllByRole("textbox");

    // Update first widget
    fireEvent.change(textareas[0], { target: { value: "Updated widget 1" } });
    fireEvent.blur(textareas[0]);

    await waitFor(() => {
      expect(vi.mocked(api).saveWidget).toHaveBeenCalledTimes(1);
      expect(vi.mocked(api).saveWidget).toHaveBeenCalledWith({
        id: "1",
        text: "Updated widget 1",
      });
    });

    // Second widget should still have its original value
    expect((textareas[1] as HTMLTextAreaElement).value).toBe("Widget 2");
  });

  it("handles API error when loading widgets", async () => {
    vi.mocked(api).getWidgets.mockRejectedValue(new Error("Failed to fetch"));

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      expect(vi.mocked(api).getWidgets).toHaveBeenCalled();
    });

    // Should show empty state on error
    expect(screen.getByText(/no widgets yet/i)).toBeDefined();
  });

  it("reverts widget creation on API error", async () => {
    vi.mocked(api).getWidgets.mockResolvedValue([]);
    vi.mocked(api).saveWidget.mockRejectedValue(new Error("Failed to save"));

    renderWithProvider(<WidgetList />);

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText(/no widgets yet/i)).toBeDefined();
    });

    const addButton = screen.getByRole("button", { name: /add widget/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(vi.mocked(api).saveWidget).toHaveBeenCalled();
    });

    // Widget should not appear in UI after failed save
    await waitFor(() => {
      expect(screen.queryByRole("textbox")).toBeNull();
    });
  });

  it("reverts widget deletion on API error", async () => {
    const mockWidgets: Widget[] = [{ id: "1", text: "Test" }];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);
    vi.mocked(api).deleteWidget.mockRejectedValue(
      new Error("Failed to delete"),
    );

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      expect(screen.getByRole("textbox")).toBeDefined();
    });

    const deleteButton = screen.getByTitle("Delete widget");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(vi.mocked(api).deleteWidget).toHaveBeenCalled();
    });

    // Widget should still be visible after failed delete
    await waitFor(() => {
      expect(screen.getByRole("textbox")).toBeDefined();
    });
  });

  it("handles long text without jank (1000+ characters)", async () => {
    const longText = "A".repeat(1000);
    const mockWidgets: Widget[] = [{ id: "1", text: longText }];
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);
    vi.mocked(api).saveWidget.mockResolvedValue(undefined);

    renderWithProvider(<WidgetList />);

    await waitFor(() => {
      const textarea = screen.getByRole("textbox");
      expect((textarea as HTMLTextAreaElement).value).toBe(longText);
    });
  });
});
