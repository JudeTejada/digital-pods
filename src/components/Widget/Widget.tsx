import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useWidgetsContext } from "@/hooks";

interface WidgetProps {
  widgetId: string;
}

export const Widget: React.FC<WidgetProps> = ({ widgetId }) => {
  const { widgets, handleUpdateWidget, handleDeleteWidget } =
    useWidgetsContext();

  const widget = widgets.find((w) => w.id === widgetId);
  const [text, setText] = useState("");
  const [prevWidget, setPrevWidget] = useState<typeof widget | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust state during rendering when widget changes
  if (widget?.text !== prevWidget?.text) {
    setPrevWidget(widget);
    setText(widget?.text ?? "");
  }

  // Auto-expand textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  const handleBlur = () => {
    if (text !== widget?.text && widget) {
      handleUpdateWidget({ ...widget, text });
    }
  };

  return (
    <div className="relative group border border-violet-200 rounded-xl p-4 hover:border-violet-300 transition-colors bg-white">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={() => handleDeleteWidget(widgetId)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors bg-white/80 backdrop-blur-sm"
          title="Delete widget"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="w-full min-h-[7rem] resize-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-sm pr-8"
        placeholder="Start writing..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
};
