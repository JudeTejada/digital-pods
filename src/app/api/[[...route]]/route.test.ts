import { beforeEach, describe, expect, it } from "vitest";
import { api, widgets } from "../[[...route]]/route";

async function getJsonBody(response: Response) {
  const text = await response.text();
  if (!text || text.trim() === "") {
    return null;
  }
  return JSON.parse(text);
}

function makeRequest(method: string, path: string, body?: string) {
  return api.request(`/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("API Routes", () => {
  beforeEach(() => {
    widgets.clear();
  });

  describe("GET /api/widgets", () => {
    it("returns empty array when no widgets exist", async () => {
      const response = await makeRequest("GET", "/widgets");

      expect(response.status).toBe(200);
      const data = await getJsonBody(response);
      expect(data).toEqual([]);
    });
  });

  describe("POST /api/widgets", () => {
    it("creates a new widget", async () => {
      const response = await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ id: "new-id", text: "New widget content" }),
      );

      expect(response.status).toBe(200);
      const data = await getJsonBody(response);
      expect(data).toEqual({ success: true });

      // Verify widget was created by fetching it
      const getResponse = await makeRequest("GET", "/widgets");
      const widgetsData = await getJsonBody(getResponse);
      expect(widgetsData).toContainEqual({
        id: "new-id",
        text: "New widget content",
      });
    });

    it("updates an existing widget", async () => {
      // Create initial widget
      await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ id: "update-id", text: "Initial text" }),
      );

      // Update widget
      const response = await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ id: "update-id", text: "Updated text" }),
      );

      expect(response.status).toBe(200);

      // Verify update
      const getResponse = await makeRequest("GET", "/widgets");
      const widgetsData = await getJsonBody(getResponse);
      expect(widgetsData).toContainEqual({
        id: "update-id",
        text: "Updated text",
      });
    });

    it("returns 400 when id is missing", async () => {
      const response = await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ text: "Widget without id" }),
      );

      expect(response.status).toBe(400);
      const data = await getJsonBody(response);
      expect(data).toEqual({ error: "ID is required" });
    });
  });

  describe("DELETE /api/widgets/:id", () => {
    it("deletes a widget by id", async () => {
      // Create a widget to delete
      await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ id: "delete-me", text: "To be deleted" }),
      );

      const response = await makeRequest("DELETE", "/widgets/delete-me");

      expect(response.status).toBe(200);
      const data = await getJsonBody(response);
      expect(data).toEqual({ success: true });

      // Verify widget was deleted
      const getResponse = await makeRequest("GET", "/widgets");
      const widgetsData = await getJsonBody(getResponse);
      expect(widgetsData).not.toContainEqual({
        id: "delete-me",
        text: "To be deleted",
      });
    });
  });

  describe("Full workflow", () => {
    it("handles create, read, update, delete cycle", async () => {
      await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ id: "workflow-id", text: "Initial" }),
      );

      let getResponse = await makeRequest("GET", "/widgets");
      let widgetsData = await getJsonBody(getResponse);
      expect(widgetsData).toContainEqual({
        id: "workflow-id",
        text: "Initial",
      });

      await makeRequest(
        "POST",
        "/widgets",
        JSON.stringify({ id: "workflow-id", text: "Updated" }),
      );

      getResponse = await makeRequest("GET", "/widgets");
      widgetsData = await getJsonBody(getResponse);
      expect(widgetsData).toContainEqual({
        id: "workflow-id",
        text: "Updated",
      });

      await makeRequest("DELETE", "/widgets/workflow-id");

      getResponse = await makeRequest("GET", "/widgets");
      widgetsData = await getJsonBody(getResponse);
      expect(widgetsData).toHaveLength(0);
    });
  });
});
