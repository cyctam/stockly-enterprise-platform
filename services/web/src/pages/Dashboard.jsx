import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  PackageCheck,
  RefreshCw,
  Truck,
  AlertTriangle,
  Activity,
  Clock3,
} from "lucide-react";

import { inventoryService } from "../services/inventoryService";
import { procurementService } from "../services/procurementService";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime, formatNumber, formatQuantity } from "../utils/formatters";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [summary, setSummary] = useState({
    totalMaterials: 0,
    lowStockItems: 0,
    pendingRequests: 0,
    todaysInflow: 0,
  });
  const [materialsData, setMaterialsData] = useState([]);
  const [inflowData, setInflowData] = useState([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const invSum = await inventoryService.getDashboardSummary();
      const procSum = await procurementService.getDashboardSummary();
      const mats = await inventoryService.getMaterials();
      const inflows = await inventoryService.getStockInflowLog();

      setSummary({
        totalMaterials: invSum?.totalMaterials || 0,
        lowStockItems: invSum?.lowStockItems || 0,
        pendingRequests: procSum?.pendingRequests || 0,
        todaysInflow: invSum?.todaysInflow || 0,
      });
      setMaterialsData(mats || []);
      setInflowData(inflows || []);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const criticalMaterials = useMemo(() => {
    return (materialsData || [])
      .filter((item) => item.status !== "Healthy")
      .slice(0, 6);
  }, [materialsData]);

  const recentInflows = useMemo(() => {
    return (inflowData || []).slice(0, 5);
  }, [inflowData]);

  const stats = [
    {
      label: "Total materials",
      value: summary.totalMaterials,
      description: "Registered inventory items",
      icon: Boxes,
      iconStyle: "bg-blue-50 text-blue-700",
      accent: "border-l-blue-500",
      href: "/materials",
    },
    {
      label: "Low stock",
      value: summary.lowStockItems,
      description: "Items need attention",
      icon: AlertTriangle,
      iconStyle: "bg-amber-50 text-amber-700",
      accent: "border-l-amber-500",
      href: "/alerts",
    },
    {
      label: "Pending requests",
      value: summary.pendingRequests,
      description: "Waiting for approval",
      icon: ClipboardList,
      iconStyle: "bg-violet-50 text-violet-700",
      accent: "border-l-violet-500",
      href: "/purchase-requests",
    },
    {
      label: "Today's inflow",
      value: summary.todaysInflow,
      description: "Inbound stock recorded",
      icon: Truck,
      iconStyle: "bg-emerald-50 text-emerald-700",
      accent: "border-l-emerald-500",
      href: "/stock-inflow",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={22} className="animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading operational data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Something went wrong while retrieving operational data. Please try
            again.
          </p>
          <button
            type="button"
            onClick={fetchAllData}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <RefreshCw size={15} />
            Retry loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            <Activity size={14} />
            Operations center
          </div>
          <h1 className="font-['Manrope'] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good overview.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            A clear view of your inventory, purchasing activity, and incoming
            stock movements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchAllData}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <Link
            to="/purchase-requests/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <span className="text-lg leading-none">+</span>
            New request
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Snapshot
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              Inventory at a glance
            </h2>
          </div>
          <span className="text-xs text-slate-400">Current figures</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.href}
                className={`group relative overflow-hidden rounded-xl border border-slate-200 border-l-[3px] ${stat.accent} bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-3 font-['Manrope'] text-3xl font-bold tracking-tight text-slate-900">
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconStyle}`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">
                    {stat.description}
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="text-slate-300 transition group-hover:text-blue-600"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <AlertTriangle size={16} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Inventory watchlist
                </h2>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Materials that need operational attention.
              </p>
            </div>
            <Link
              to="/alerts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 transition hover:text-blue-900"
            >
              View all alerts
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {criticalMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <PackageCheck size={23} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  Inventory looks healthy
                </h3>
                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  There are currently no materials requiring attention.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Material
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current stock
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criticalMaterials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <Link
                          to={`/materials/${material.id}`}
                          className="text-sm font-semibold text-slate-800 transition hover:text-blue-700"
                        >
                          {material.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {material.category || "Uncategorized"}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {formatQuantity(material.currentStock, material.unit)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={material.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <span className="text-xs text-slate-400">
              Showing {criticalMaterials.length} materials
            </span>
            <Link
              to="/materials"
              className="text-xs font-semibold text-slate-600 hover:text-blue-700"
            >
              Browse inventory
            </Link>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <ArrowDownRight size={17} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent stock inflow
                </h2>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Latest inbound stock records.
              </p>
            </div>
            <Link
              to="/stock-inflow"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              View log
            </Link>
          </div>

          {recentInflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Truck size={22} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                No inbound records
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                Stock movements will appear here after deliveries are recorded.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentInflows.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50/70"
                >
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <ArrowDownRight size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {entry.source || "Unknown Supplier"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {entry.note || "Inbound delivery"}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock3 size={12} />
                      {formatDateTime(entry.timestamp)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-sm font-bold text-emerald-700">
                      +{formatNumber(entry.quantity)}
                    </span>
                    <p className="mt-1 text-[10px] text-slate-400">Received</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <Link
              to="/stock-inflow"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-blue-700"
            >
              Open complete inflow history
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Activity size={19} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Keep operations moving
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
              Review inventory alerts and follow up on pending purchase requests
              to keep stock availability under control.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/alerts"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Review alerts
            <ArrowRight size={13} />
          </Link>
          <Link
            to="/purchase-requests"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Purchase requests
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}