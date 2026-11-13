import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Boxes,
  LayoutDashboard,
  ClipboardList,
  Plus,
  ArrowDownToLine,
  Bell,
  ChevronRight,
  Search,
} from "lucide-react";

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Materials", path: "/materials", icon: Boxes },
      { label: "Purchase Requests", path: "/purchase-requests", icon: ClipboardList },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Create Request", path: "/purchase-requests/new", icon: Plus },
      { label: "Stock Inflow", path: "/stock-inflow", icon: ArrowDownToLine },
      { label: "Alerts", path: "/alerts", icon: Bell },
    ],
  },
];

const breadcrumbsMap = {
  "/dashboard": "Dashboard",
  "/materials": "Materials",
  "/purchase-requests": "Purchase Requests",
  "/purchase-requests/new": "Create Request",
  "/stock-inflow": "Stock Inflow",
  "/alerts": "Alerts",
};

function getPageTitle(pathname) {
  if (breadcrumbsMap[pathname]) {
    return breadcrumbsMap[pathname];
  }
  if (pathname.startsWith("/materials/")) {
    return "Material Details";
  }
  if (pathname.startsWith("/purchase-requests/")) {
    return "Purchase Request Details";
  }
  return "Dashboard";
}

export default function AppLayout() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Boxes size={21} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <span className="brand-name">stockly</span>
            <span className="brand-caption">SUPPLY CHAIN</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              <div className="nav-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/purchase-requests" || item.path === "/materials"}
                      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          <div className="sidebar-profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <span className="profile-name">Administrator</span>
              <span className="profile-role">Workspace admin</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <div className="breadcrumb">
              <span className="breadcrumb-muted">Workspace</span>
              <ChevronRight size={15} />
              <span className="breadcrumb-current">{pageTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status">
              <span className="status-dot" />
              <span>System operational</span>
            </div>
            
            <div style={{ position: "relative" }}>
              <button 
                type="button" 
                className="topbar-icon-button" 
                aria-label="Search"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={18} />
              </button>
              {showSearch && (
                <div style={{
                  position: "absolute", top: "48px", right: "0", width: "260px",
                  background: "white", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0", padding: "8px", zIndex: 50
                }}>
                  <input 
                    type="text" 
                    placeholder="Search inventory, requests..." 
                    style={{ width: "100%", border: "none", outline: "none", fontSize: "13px", padding: "6px" }}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button 
                type="button" 
                className="topbar-icon-button notification-button" 
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={18} />
                <span className="notification-indicator" />
              </button>
              {showNotifications && (
                <div style={{
                  position: "absolute", top: "48px", right: "0", width: "300px",
                  background: "white", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0", padding: "16px", zIndex: 50
                }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b", marginBottom: "12px" }}>Notifications</h4>
                  <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", color: "#334155" }}>Low stock alert: Originium</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Just now</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "#334155" }}>New purchase request submitted</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>10 minutes ago</p>
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-divider" />
            
            <div className="topbar-user">
              <div className="topbar-avatar">A</div>
              <div className="topbar-user-info">
                <span>Administrator</span>
                <small>Admin</small>
              </div>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>Stockly Supply Chain</span>
          <span>Inventory management workspace</span>
        </footer>
      </div>
    </div>
  );
}