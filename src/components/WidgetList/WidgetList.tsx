"use client";
import { Plus } from "lucide-react";
import { useWidgetsContext } from "@/hooks";
import { Widget } from "../Widget";

export const WidgetList: React.FC = () => {
  const { widgets, loading, handleAddWidget } = useWidgetsContext();

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-8">Loading widgets...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Pod</h1>
        <button
          type="button"
          onClick={handleAddWidget}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Add Widget
        </button>
      </div>

      <div className="space-y-4">
        {widgets.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No widgets yet. Click "Add Widget" to get started.
          </div>
        ) : (
          widgets.map((widget) => (
            <Widget key={widget.id} widgetId={widget.id} />
          ))
        )}
      </div>
    </div>
  );
};
