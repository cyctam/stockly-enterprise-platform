import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Activity, 
  PlusCircle 
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Materials", path: "/materials", icon: Package },
  { label: "Purchase Requests", path: "/purchase-requests", icon: ShoppingCart },
  { label: "Create Request", path: "/purchase-requests/new", icon: PlusCircle },
  { label: "Stock Inflow", path: "/stock-inflow", icon: Activity },
  { label: "Alerts", path: "/alerts", icon: AlertTriangle },
];

const breadcrumbsMap = {
  "/dashboard": "Dashboard Overview",
  "/materials": "Materials Inventory",
  "/purchase-requests": "Purchase Requests",
  "/purchase-requests/new": "Create Purchase Request",
  "/stock-inflow": "Stock Inflow Log",
  "/alerts": "Low Stock Alerts",
};

export default function AppLayout() {
  const location = useLocation();
  const pageTitle = breadcrumbsMap[location.pathname] ?? "Supply Chain Platform";

  return (
    <div className="min-h-screen bg-surface text-slate-800 font-sans flex">
      
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 text-slate-300 z-30">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-brand-900/50">
            S
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              STOCKLY
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Enterprise</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-brand-600 text-white shadow-md shadow-brand-900/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={18} 
                      className={isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors"} 
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold">
              ST
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ops Admin</p>
              <p className="text-xs text-slate-400">Warehouse HQ</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500 font-bold">
                Stockly Platform
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                {pageTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </div>
              <Link
                to="/purchase-requests/new"
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-brand-700 hover:shadow transition-all"
              >
                + New Request
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 overflow-y-auto">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}