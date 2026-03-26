import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { InsightsPage } from "@/components/insights/InsightsPage";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Route>
      </Routes>
      <ChatWidget />
    </>
  );
}
