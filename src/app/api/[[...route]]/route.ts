import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs";

type Widget = {
  id: string;
  text: string;
};

// In-memory store
export const widgets = new Map<string, Widget>();

const app = new Hono().basePath("/api");

app.get("/widgets", (c) => {
  return c.json([...widgets.values()]);
});

app.post("/widgets", async (c) => {
  const body = await c.req.json<Widget>();

  if (!body.id) {
    return c.json({ error: "ID is required" }, 400);
  }

  widgets.set(body.id, {
    id: body.id,
    text: body.text || "",
  });

  return c.json({ success: true });
});

app.delete("/widgets/:id", (c) => {
  const id = c.req.param("id");
  widgets.delete(id);
  return c.json({ success: true });
});

export const api = app;

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
