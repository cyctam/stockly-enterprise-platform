import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StateCard from "../components/StateCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableEmptyState,
} from "../components/ui/Table";
import { inventoryService } from "../services/inventoryService";
import { formatDateTime, formatNumber } from "../utils/formatters";

const SOURCE_OPTIONS = ["Kodo Metals", "CementWorks Ltd", "North Yard"];

export default function StockInflowLog() {
  const [inflowData, setInflowData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [sourceValue, setSourceValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const inflows = await inventoryService.getStockInflowLog();
      const materials = await inventoryService.getMaterials();
      setInflowData(inflows || []);
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

  const filteredInflows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return (inflowData || []).filter((entry) => {
      const materialName = materialsMap.get(entry.materialId) ?? "";
      const matchesSearch =
        !query ||
        materialName.toLowerCase().includes(query) ||
        entry.source?.toLowerCase().includes(query) ||
        entry.note?.toLowerCase().includes(query);
      const matchesSource = !sourceValue || entry.source === sourceValue;
      return matchesSearch && matchesSource;
    });
  }, [inflowData, searchValue, sourceValue, materialsMap]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Inflow Log"
        description="Review inbound deliveries received from key suppliers."
        actions={
          <>
            <Button variant="secondary">Export log</Button>
            <Link to="/materials">
              <Button>View materials</Button>
            </Link>
          </>
        }
      />

      <div className="card p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search inflow"
            placeholder="Search by material, source, or note"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Select
            label="Filter by source"
            value={sourceValue}
            onChange={(event) => setSourceValue(event.target.value)}
          >
            <option value="">All sources</option>
            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Total inflows
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatNumber((inflowData || []).length)}
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
            title="Inbound deliveries"
            subtitle={`${filteredInflows.length} inflow records`}
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
                  <TableHeaderCell>Source</TableHeaderCell>
                  <TableHeaderCell>Quantity</TableHeaderCell>
                  <TableHeaderCell>Note</TableHeaderCell>
                  <TableHeaderCell>Received</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInflows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <TableEmptyState
                        title="No inflow records"
                        description="Inbound deliveries will appear once logged by the inventory service."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredInflows.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {materialsMap.get(entry.materialId) ?? entry.materialId}
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.materialId}
                        </p>
                      </TableCell>
                      <TableCell>{entry.source}</TableCell>
                      <TableCell>+{formatNumber(entry.quantity)}</TableCell>
                      <TableCell>{entry.note || "—"}</TableCell>
                      <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
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