import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StateCard from "../components/StateCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { inventoryService } from "../services/inventoryService";
import { procurementService } from "../services/procurementService";
import { formatQuantity, formatStockStatus } from "../utils/formatters";

const DEFAULT_FORM = {
  materialId: "",
  quantity: "",
  reason: "",
};

export default function PurchaseRequestCreate() {
  const navigate = useNavigate();
  
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getMaterials();
      setMaterialsData(data || []);
      setIsError(false);
      if (data && data.length > 0 && !form.materialId) {
        setForm((prev) => ({ ...prev, materialId: data[0].id }));
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const selectedMaterial = useMemo(() => {
    return (materialsData || []).find(
      (material) => material.id === form.materialId,
    );
  }, [materialsData, form.materialId]);

  const status =
    selectedMaterial?.status ||
    formatStockStatus(
      selectedMaterial?.currentStock ?? 0,
      selectedMaterial?.minStock ?? 0,
    );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      await procurementService.createPurchaseRequest({
        materialId: form.materialId,
        quantity: Number(form.quantity),
        reason: form.reason,
      });
      setSubmitStatus("success");
      setForm(DEFAULT_FORM);
      navigate("/purchase-requests");
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error?.message || "Unable to submit the purchase request.",
      );
    }
  };

  if (loading) {
    return <StateCard />;
  }

  if (isError) {
    return (
      <StateCard
        variant="error"
        actionLabel="Retry loading"
        onAction={fetchMaterials}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Purchase Request"
        description="Submit a new procurement request for low-stock materials."
        actions={
          <Link to="/purchase-requests">
            <Button variant="secondary">Back to requests</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader
            title="Request details"
            subtitle="Provide material selection, quantity, and a brief reason."
          />
          <CardBody>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Select
                label="Material"
                value={form.materialId}
                onChange={handleChange("materialId")}
                required
              >
                {(materialsData || []).map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name} • {material.category}
                  </option>
                ))}
              </Select>
              <Input
                label="Quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={handleChange("quantity")}
                required
              />
              <Input
                label="Reason for request"
                placeholder="Explain why this order is needed"
                value={form.reason}
                onChange={handleChange("reason")}
                required
              />

              {errorMessage && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={submitStatus === "loading"}>
                  {submitStatus === "loading" ? "Submitting..." : "Submit request"}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setForm(DEFAULT_FORM)}
                >
                  Reset form
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Material context"
            subtitle="Snapshot of the selected material stock status."
          />
          <CardBody>
            {selectedMaterial ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Material
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedMaterial.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMaterial.category} • {selectedMaterial.unit}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Current stock
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatQuantity(
                        selectedMaterial.currentStock,
                        selectedMaterial.unit,
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Minimum stock
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {formatQuantity(
                        selectedMaterial.minStock,
                        selectedMaterial.unit,
                      )}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {status}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {status === "Healthy"
                      ? "Coverage is stable. Submit only if anticipating demand."
                      : "Stock is below target. Request recommended."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  No materials available
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Connect the inventory service or load materials to create a
                  request.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}