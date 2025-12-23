import type { Widget } from "@/types";

const API_BASE = "/api/widgets";

export const api = {
  getWidgets: async (): Promise<Widget[]> => {
    const res = await fetch(API_BASE);
    return res.json();
  },

  saveWidget: async (widget: Widget): Promise<void> => {
    await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(widget),
    });
  },

  deleteWidget: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
  },
};
