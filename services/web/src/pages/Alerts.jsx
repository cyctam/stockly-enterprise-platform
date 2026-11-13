import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StateCard from "../components/StateCard";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import { inventoryService } from "../services/inventoryService";
import { formatDateTime, formatNumber } from "../utils/formatters";

const SEVERITY_OPTIONS = ["Low Stock", "Critical"];

export default function Alerts() {
  const [alertsData, setAlertsData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [severityValue, setSeverityValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const alerts = await inventoryService.getAlerts();
      const materials = await inventoryService.getMaterials();
      setAlertsData(alerts || []);
      setMaterialsData(materials || []);
      setIsError(false);
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const materialsMap = useMemo(() => {
    const map = new Map();
    (materialsData || []).forEach((material) => {
      map.set(material.id, material.name);
    });
    return map;
  }, [materialsData]);

  const filteredAlerts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return (alertsData || []).filter((alert) => {
      const materialName = materialsMap.get(alert.materialId) ?? "";
      const matchesSearch =
        !query ||
        materialName.toLowerCase().includes(query) ||
        alert.materialId?.toLowerCase().includes(query);
      const matchesSeverity =
        !severityValue || alert.severity === severityValue;
      return matchesSearch && matchesSeverity;
    });
  }, [alertsData, searchValue, severityValue, materialsMap]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Low Stock"
        description="Prioritize materials below minimum thresholds and take immediate action."
        actions={
          <>
            <Button variant="secondary">Export alerts</Button>
            <Link to="/purchase-requests/new">
              <Button>Create request</Button>
            </Link>
          </>
        }
      />

      <div className="card p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search alerts"
            placeholder="Search by material name or ID"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Select
            label="Filter by severity"
            value={severityValue}
            onChange={(event) => setSeverityValue(event.target.value)}
          >
            <option value="">All severities</option>
            {SEVERITY_OPTIONS.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </Select>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Critical alerts
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatNumber(
                (alertsData || []).filter(
                  (alert) => alert.severity === "Critical"
                ).length
              )}
            </p>
          </div>
        </div>
      </div>

      {loading && <StateCard />}
      
      {isError && (
        <StateCard
          variant="error"
          actionLabel="Retry loading"
          onAction={fetchData}
        />
      )}

      {!loading && !isError && (
        <Card>
          <CardHeader
            title="Low stock alerts"
            subtitle={`${filteredAlerts.length} alerts requiring attention`}
            actions={
              <div className="text-xs text-slate-500">
                Last sync: {formatDateTime(new Date().toISOString())}
              </div>
            }
          />
          <CardBody className="p-0">
            <Table className="shadow-none border-none">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Material</TableHeaderCell>
                  <TableHeaderCell>Current stock</TableHeaderCell>
                  <TableHeaderCell>Minimum stock</TableHeaderCell>
                  <TableHeaderCell>Severity</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Action
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <TableEmptyState
                        title="No active alerts"
                        description="Inventory levels are healthy across all tracked materials."
                        action={
                          <Link to="/materials">
                            <Button variant="secondary">Review materials</Button>
                          </Link>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {materialsMap.get(alert.materialId) ?? alert.materialId}
                        <p className="mt-1 text-xs text-slate-500">
                          {alert.materialId}
                        </p>
                      </TableCell>
                      <TableCell>{formatNumber(alert.currentStock)}</TableCell>
                      <TableCell>{formatNumber(alert.minStock)}</TableCell>
                      <TableCell>
                        <StatusBadge status={alert.severity} />
                      </TableCell>
                      <TableCell>{formatDateTime(alert.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/materials/${alert.materialId}`}>
                          <Button variant="ghost">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}