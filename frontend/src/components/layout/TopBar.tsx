import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/": "Executive Dashboard",
  "/insights": "Insight Explorer",
  "/lineage": "Insight Lineage",
  "/pipeline": "Data Pipeline",
};

export function TopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "Hooli Heard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400">
          Last synced: 2 min ago
        </span>
        <div className="h-2 w-2 rounded-full bg-emerald-400" title="All sources connected" />
      </div>
    </header>
  );
}
