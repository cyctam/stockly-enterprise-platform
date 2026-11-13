import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StateCard from "../components/StateCard";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/Table";
import { inventoryService } from "../services/inventoryService";
import { procurementService } from "../services/procurementService";
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
    return (materialsData || []).filter((item) => item.status !== "Healthy").slice(0, 5);
  }, [materialsData]);

  const recentInflows = useMemo(() => {
    return (inflowData || []).slice(0, 5);
  }, [inflowData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Overview"
        description="Monitor inventory health, purchasing activity, and inbound stock movements."
        actions={
          <>
            <Link to="/materials">
              <Button variant="secondary">View materials</Button>
            </Link>
            <Link to="/purchase-requests/new">
              <Button>Create request</Button>
            </Link>
          </>
        }
      />

      {loading && <StateCard />}
      
      {error && (
        <StateCard
          variant="error"
          actionLabel="Retry loading"
          onAction={fetchAllData}
        />
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total materials"
              value={formatNumber(summary.totalMaterials)}
              helper="Active SKUs"
              statusLabel="OK"
              accent="bg-slate-900"
              trend={{ value: "+4", label: "added this month" }}
            />
            <StatCard
              title="Low-stock items"
              value={formatNumber(summary.lowStockItems)}
              helper="Requires attention"
              statusLabel="Low"
              accent="bg-amber-500"
              trend={{ value: "6", label: "materials flagged" }}
            />
            <StatCard
              title="Pending requests"
              value={formatNumber(summary.pendingRequests)}
              helper="Awaiting approval"
              statusLabel="PR"
              accent="bg-sky-600"
              trend={{ value: "3", label: "submitted today" }}
            />
            <StatCard
              title="Today's inflow"
              value={formatNumber(summary.todaysInflow)}
              helper="Inbound deliveries"
              statusLabel="IN"
              accent="bg-emerald-600"
              trend={{ value: "2", label: "arrivals completed" }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Materials requiring attention"
                subtitle="Top items nearing minimum stock levels."
                actions={
                  <Link to="/alerts">
                    <Button variant="secondary">Review alerts</Button>
                  </Link>
                }
              />
              <CardBody className="p-0">
                {criticalMaterials.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center m-6">
                    <p className="text-sm font-semibold text-slate-900">All materials are healthy</p>
                    <p className="mt-2 text-sm text-slate-500">
                      No low-stock or critical items detected at this time.
                    </p>
                  </div>
                ) : (
                  <Table className="shadow-none border-none rounded-none">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell className="w-1/3">Material</TableHeaderCell>
                        <TableHeaderCell className="w-1/4">Category</TableHeaderCell>
                        <TableHeaderCell className="w-1/6">Stock</TableHeaderCell>
                        <TableHeaderCell className="w-1/6">Status</TableHeaderCell>
                        <TableHeaderCell className="w-1/4">Updated</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {criticalMaterials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-semibold text-slate-900">
                            <Link to={`/materials/${material.id}`} className="hover:text-brand-600 transition-colors">
                              {material.name}
                            </Link>
                          </TableCell>
                          <TableCell>{material.category}</TableCell>
                          <TableCell>
                            {formatQuantity(material.currentStock, material.unit)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={material.status} />
                          </TableCell>
                          <TableCell>
                            {formatDateTime(material.updatedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Recent inflow log"
                subtitle="Last inbound deliveries received."
                actions={
                  <Link to="/stock-inflow">
                    <Button variant="secondary">Open log</Button>
                  </Link>
                }
              />
              <CardBody>
                <div className="space-y-3">
                  {recentInflows.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-sm font-semibold text-slate-900">No inflow records</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Inbound deliveries will appear here once received.
                      </p>
                    </div>
                  ) : (
                    recentInflows.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {entry.source || "Unknown Supplier"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {entry.note || "Inbound delivery"}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-sm font-semibold text-emerald-600">
                            +{formatNumber(entry.quantity)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Operational highlights"
              subtitle="Current supply chain posture across active locations."
              actions={<Button variant="secondary">Export summary</Button>}
            />
            <CardBody>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Warehouse throughput",
                    value: "92%",
                    description: "Average handling capacity across sites.",
                  },
                  {
                    label: "Vendor reliability",
                    value: "4.6 / 5",
                    description: "On-time delivery score for top vendors.",
                  },
                  {
                    label: "Backorder risk",
                    value: "Low",
                    description: "Projected based on current demand signals.",
                  },
                ].map((highlight) => (
                  <div key={highlight.label} className="rounded-lg border border-slate-200 p-4 hover:border-brand-200 transition">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {highlight.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {highlight.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}