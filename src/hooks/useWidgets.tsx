"use client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/api";
import type { Widget as WidgetType } from "@/types";

interface WidgetsContextType {
  widgets: WidgetType[];
  loading: boolean;
  handleAddWidget: () => Promise<void>;
  handleUpdateWidget: (widget: WidgetType) => Promise<void>;
  handleDeleteWidget: (id: string) => Promise<void>;
}

const WidgetsContext = createContext<WidgetsContextType | undefined>(undefined);

export const WidgetsProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: WidgetsContextType;
}) => {
  return (
    <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>
  );
};

export const useWidgetsContext = () => {
  const context = useContext(WidgetsContext);
  if (!context) {
    throw new Error("useWidgetsContext must be used within a WidgetsProvider");
  }
  return context;
};

// NOTE: CAN BE FURTHER OPTIMIZED AND SETUP BETTER , IF USING REACT QUERY , with  useQuery, useMutation
export const useWidgetsState = () => {
  const [widgets, setWidgets] = useState<WidgetType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWidgets = useCallback(async () => {
    try {
      const data = await api.getWidgets();
      setWidgets(data);
    } catch (error) {
      console.error("Failed to load widgets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  const handleAddWidget = async () => {
    const newWidget: WidgetType = {
      id: uuidv4(),
      text: "",
    };

    setWidgets([...widgets, newWidget]);

    try {
      await api.saveWidget(newWidget);
    } catch (error) {
      console.error("Failed to create widget:", error);
      setWidgets(widgets);
    }
  };

  const handleUpdateWidget = async (updatedWidget: WidgetType) => {
    setWidgets(
      widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)),
    );

    try {
      await api.saveWidget(updatedWidget);
    } catch (error) {
      console.error("Failed to update widget:", error);
    }
  };

  const handleDeleteWidget = async (id: string) => {
    const previousWidgets = widgets;
    setWidgets(widgets.filter((w) => w.id !== id));

    try {
      await api.deleteWidget(id);
    } catch (error) {
      console.error("Failed to delete widget:", error);
      setWidgets(previousWidgets);
    }
  };

  return {
    widgets,
    loading,
    handleAddWidget,
    handleUpdateWidget,
    handleDeleteWidget,
  };
};

export const WidgetsProviderRoot = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const state = useWidgetsState();
  return <WidgetsProvider value={state}>{children}</WidgetsProvider>;
};
