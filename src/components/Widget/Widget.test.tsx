import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WidgetsProviderRoot } from "@/hooks";
import { api } from "@/lib/api";
import type { Widget as WidgetType } from "@/types";
import { Widget } from "./Widget";

// Mock the api module
vi.mock("@/lib/api");

describe("Widget", () => {
  const mockWidgets: WidgetType[] = [
    { id: "test-id", text: "Test content" },
    { id: "empty-id", text: "" },
    { id: "widget-1", text: "First widget" },
    { id: "widget-2", text: "Second widget" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api).getWidgets.mockResolvedValue(mockWidgets);
  });

  it("renders textarea with correct initial text", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="test-id" />
      </WidgetsProviderRoot>,
    );

    const textarea = (await screen.findByRole(
      "textbox",
    )) as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(textarea.value).toBe("Test content");
  });

  it("handles text changes", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="test-id" />
      </WidgetsProviderRoot>,
    );

    const textarea = (await screen.findByRole(
      "textbox",
    )) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "New content" } });
    expect(textarea.value).toBe("New content");
    // onUpdate should NOT be called during typing
    expect(vi.mocked(api).saveWidget).not.toHaveBeenCalled();
  });

  it("calls onUpdate on blur when text has changed", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="test-id" />
      </WidgetsProviderRoot>,
    );

    const textarea = await screen.findByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated content" } });
    fireEvent.blur(textarea);

    expect(vi.mocked(api).saveWidget).toHaveBeenCalledWith({
      id: "test-id",
      text: "Updated content",
    });
  });

  it("does not call onUpdate on blur when text has not changed", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="test-id" />
      </WidgetsProviderRoot>,
    );

    const textarea = await screen.findByRole("textbox");
    fireEvent.blur(textarea);

    expect(vi.mocked(api).saveWidget).not.toHaveBeenCalled();
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="test-id" />
      </WidgetsProviderRoot>,
    );

    const deleteButton = await screen.findByTitle("Delete widget");
    fireEvent.click(deleteButton);

    expect(vi.mocked(api).deleteWidget).toHaveBeenCalledWith("test-id");
  });

  it("shows delete button", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="test-id" />
      </WidgetsProviderRoot>,
    );

    const deleteButton = await screen.findByTitle("Delete widget");
    const deleteButtonContainer = deleteButton.parentElement;
    expect(deleteButton).toBeDefined();
    expect(
      deleteButtonContainer?.classList.contains("transition-opacity"),
    ).toBe(true);
  });

  it("handles empty text", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="empty-id" />
      </WidgetsProviderRoot>,
    );

    const textarea = (await screen.findByRole(
      "textbox",
    )) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    fireEvent.change(textarea, { target: { value: "Some text" } });
    fireEvent.blur(textarea);

    expect(vi.mocked(api).saveWidget).toHaveBeenCalledWith({
      id: "empty-id",
      text: "Some text",
    });
  });

  it("maintains independent state between widgets", async () => {
    render(
      <WidgetsProviderRoot>
        <Widget widgetId="widget-1" />
        <Widget widgetId="widget-2" />
      </WidgetsProviderRoot>,
    );

    const textareas = await screen.findAllByRole("textbox");
    expect(textareas).toHaveLength(2);
    expect((textareas[0] as HTMLTextAreaElement).value).toBe("First widget");
    expect((textareas[1] as HTMLTextAreaElement).value).toBe("Second widget");

    // Update first widget
    fireEvent.change(textareas[0], { target: { value: "Updated first" } });
    fireEvent.blur(textareas[0]);

    expect(vi.mocked(api).saveWidget).toHaveBeenCalledWith({
      id: "widget-1",
      text: "Updated first",
    });

    // Second widget should still have its original value
    expect((textareas[1] as HTMLTextAreaElement).value).toBe("Second widget");
  });
});
