import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StateCard from "../components/StateCard";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
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
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { procurementService } from "../services/procurementService";
import { inventoryService } from "../services/inventoryService";
import {
  formatDateTime,
  formatNumber,
  formatRequestStatus,
} from "../utils/formatters";

const STATUS_OPTIONS = ["Pending", "Approved", "Received"];

export default function PurchaseRequestList() {
  const [requestsData, setRequestsData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = await procurementService.getPurchaseRequests();
      const materials = await inventoryService.getMaterials();
      setRequestsData(requests || []);
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

  const filteredRequests = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return (requestsData || []).filter((request) => {
      const status = formatRequestStatus(request.status);
      const materialName = materialsMap.get(request.materialId) ?? "";
      const matchesSearch =
        !query ||
        request.requestCode?.toLowerCase().includes(query) ||
        materialName.toLowerCase().includes(query) ||
        request.reason?.toLowerCase().includes(query);
      const matchesStatus = !statusValue || status === statusValue;
      return matchesSearch && matchesStatus;
    });
  }, [requestsData, searchValue, statusValue, materialsMap]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Requests"
        description="Track procurement submissions, approvals, and delivery readiness."
        actions={
          <>
            <Button variant="secondary">Export list</Button>
            <Link to="/purchase-requests/new">
              <Button>Create request</Button>
            </Link>
          </>
        }
      />

      <div className="card p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search requests"
            placeholder="Search by code, material, or reason"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Select
            label="Filter by status"
            value={statusValue}
            onChange={(event) => setStatusValue(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Pending approvals
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {
                (requestsData || []).filter(
                  (request) => formatRequestStatus(request.status) === "Pending"
                ).length
              }
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
            title="Request queue"
            subtitle={`${filteredRequests.length} requests matching current filters`}
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
                  <TableHeaderCell>Request code</TableHeaderCell>
                  <TableHeaderCell>Material</TableHeaderCell>
                  <TableHeaderCell>Quantity</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Requested by</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Action
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <TableEmptyState
                        title="No requests found"
                        description="Adjust your filters or create a new purchase request."
                        action={
                          <Link to="/purchase-requests/new">
                            <Button>Create request</Button>
                          </Link>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const status = formatRequestStatus(request.status);
                    const materialName = materialsMap.get(request.materialId) ?? request.materialId;

                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {request.requestCode}
                          <p className="mt-1 text-xs text-slate-500">
                            {request.id}
                          </p>
                        </TableCell>
                        <TableCell>{materialName}</TableCell>
                        <TableCell>
                          {formatNumber(request.quantity)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>{request.requestedBy}</TableCell>
                        <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Link to="/purchase-requests/new">
                            <Button variant="ghost">Duplicate</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}