import React, { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StateCard from "../components/StateCard";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
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
import useAsync from "../hooks/useAsync";
import { inventoryService } from "../services/inventoryService";
import {
  formatDateTime,
  formatNumber,
  formatQuantity,
  formatStockStatus,
  formatMovementType,
} from "../utils/formatters";

export default function MaterialDetail() {
  const { id } = useParams();
  const fetchMaterial = useCallback(() => {
    if (!id) return Promise.resolve(null);
    return inventoryService.getMaterialById(id);
  }, [id]);
  const fetchMovements = useCallback(() => {
    if (!id) return Promise.resolve([]);
    return inventoryService.getStockMovements(id);
  }, [id]);

  const materialState = useAsync(fetchMaterial);
  const movementsState = useAsync(fetchMovements, {
    initialData: [],
  });

  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionForm, setActionForm] = useState({
    type: "inflow",
    quantity: "",
    source: "",
    note: "",
  });

  const handleActionChange = (field) => (event) => {
    setActionForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleActionSubmit = (event) => {
    event.preventDefault();
    setIsActionOpen(false);
  };

  const material = materialState.data;
  const movements = movementsState.data ?? [];
  const status = material
    ? material.status ||
      formatStockStatus(material.currentStock, material.minStock)
    : "Healthy";

  const stockHistory = useMemo(() => {
    if (!material) return [];
    const series = movements
      .slice()
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .reduce((acc, movement) => {
        const last = acc.length
          ? acc[acc.length - 1].stock
          : material.currentStock;
        const delta =
          movement.type === "outflow" ? -movement.quantity : movement.quantity;
        acc.push({
          ...movement,
          stock: Math.max(0, last + delta),
        });
        return acc;
      }, []);
    return series.reverse().slice(0, 6);
  }, [material, movements]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Detail"
        description="Monitor stock movement history and initiate rapid procurement actions."
        actions={
          <>
            <Link to="/materials">
              <Button variant="secondary">Back to materials</Button>
            </Link>
            <Link to="/purchase-requests/new">
              <Button>Create purchase request</Button>
            </Link>
          </>
        }
      />

      {(materialState.isLoading || movementsState.isLoading) && <StateCard />}
      {(materialState.isError || movementsState.isError) && (
        <StateCard
          variant="error"
          actionLabel="Retry loading"
          onAction={() => {
            materialState.run();
            movementsState.run();
          }}
        />
      )}

      {!materialState.isLoading && !materialState.isError && !material && (
        <StateCard
          variant="error"
          title="Material not found"
          description="This material record could not be located. Confirm the material ID or return to the list."
          actionLabel="Back to materials"
          onAction={() => window.history.back()}
        />
      )}

      {!materialState.isLoading && !materialState.isError && material && (
        <>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader
                title={material.name}
                subtitle={`${material.category} • ${material.unit}`}
                actions={<StatusBadge status={status} />}
              />
              <CardBody>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Current stock
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {formatQuantity(material.currentStock, material.unit)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Minimum stock
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {formatQuantity(material.minStock, material.unit)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Last updated
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {formatDateTime(material.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Quick actions
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Initiate an inbound receipt or note a consumption event.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={() => setIsActionOpen(true)}>
                        Log stock movement
                      </Button>
                      <Link to="/purchase-requests/new">
                        <Button variant="secondary">Raise request</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Stock health
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Status is evaluated against minimum thresholds.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <StatusBadge status={status} />
                      <span className="text-sm text-slate-500">
                        {status === "Healthy"
                          ? "Inventory coverage is stable."
                          : "Inventory is below the expected threshold."}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Stock history"
                subtitle="Recent movement snapshots based on recorded transactions."
              />
              <CardBody>
                {stockHistory.length === 0 ? (
                  <TableEmptyState
                    title="No movement history"
                    description="Stock movement events will appear here once they are logged."
                  />
                ) : (
                  <div className="space-y-3">
                    {stockHistory.map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-start justify-between rounded-lg border border-slate-200 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatMovementType(movement.type)} •{" "}
                            {movement.source}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {movement.note || "Movement recorded"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {movement.type === "outflow" ? "-" : "+"}
                            {formatNumber(movement.quantity)} {material.unit}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(movement.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Movement log"
              subtitle={`${movements.length} records captured`}
            />
            <CardBody className="p-0">
              <Table className="shadow-none border-none">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Quantity</TableHeaderCell>
                    <TableHeaderCell>Source</TableHeaderCell>
                    <TableHeaderCell>Note</TableHeaderCell>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <TableEmptyState
                          title="No inflow/outflow records"
                          description="Use the quick action to log the first movement."
                        />
                      </td>
                    </tr>
                  ) : (
                    movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {formatMovementType(movement.type)}
                        </TableCell>
                        <TableCell>
                          {formatQuantity(movement.quantity, material.unit)}
                        </TableCell>
                        <TableCell>{movement.source}</TableCell>
                        <TableCell>{movement.note || "—"}</TableCell>
                        <TableCell>
                          {formatDateTime(movement.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </>
      )}

      <Modal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        title="Log stock movement"
        description="Record inbound deliveries or material usage for audit traceability."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsActionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActionSubmit}>Save movement</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleActionSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium">Type</span>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={actionForm.type}
                onChange={handleActionChange("type")}
              >
                <option value="inflow">Inflow</option>
                <option value="outflow">Outflow</option>
              </select>
            </label>
            <Input
              label="Quantity"
              type="number"
              min="0"
              placeholder="0"
              value={actionForm.quantity}
              onChange={handleActionChange("quantity")}
            />
          </div>
          <Input
            label="Source / Destination"
            placeholder="Supplier or production line"
            value={actionForm.source}
            onChange={handleActionChange("source")}
          />
          <Input
            label="Note"
            placeholder="Optional note for the movement"
            value={actionForm.note}
            onChange={handleActionChange("note")}
          />
        </form>
      </Modal>
    </div>
  );
}
