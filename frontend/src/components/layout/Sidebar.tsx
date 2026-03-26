import { NavLink, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Filter keys shared between Dashboard and Insights pages */
const SHARED_FILTER_KEYS = ["product_area", "insight_category", "vertical", "icp", "source_tool", "time_range", "date_from", "account_name"];

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Insights",
    path: "/insights",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const [searchParams] = useSearchParams();

  /** Build a path that carries over active shared filters */
  const withFilters = (basePath: string) => {
    const carry = new URLSearchParams();
    for (const key of SHARED_FILTER_KEYS) {
      const val = searchParams.get(key);
      if (val) carry.set(key, val);
    }
    const qs = carry.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <aside className="flex h-screen w-48 flex-col bg-slate-800 text-white">
      {/* Branding */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-700/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold">
          H
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">Hooli Heard</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Customer Intel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={withFilters(item.path)}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-700/70 text-white"
                    : "text-slate-300 hover:bg-slate-700/40 hover:text-white",
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
        ))}
      </nav>

      {/* CoreWeave logo + LFG */}
      <div className="flex flex-col items-center gap-1.5 px-6 pb-3">
        <img
          src="/coreweave-logo.png"
          alt="CoreWeave"
          className="h-14 w-14 rounded-lg bg-white p-1"
        />
        <span className="text-sm font-black tracking-[0.25em] text-slate-400">
          LFG
        </span>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 px-6 py-4">
        <p className="text-xs text-slate-500">
          Hackathon 2026 -- Built with Claude
        </p>
      </div>
    </aside>
  );
}
