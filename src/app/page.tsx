"use client";

import { WidgetList } from "@/components/WidgetList";
import { WidgetsProviderRoot } from "@/hooks";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <WidgetsProviderRoot>
        <WidgetList />
      </WidgetsProviderRoot>
    </main>
  );
}
