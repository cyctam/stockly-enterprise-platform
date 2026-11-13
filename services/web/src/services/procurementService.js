import { procurementApi } from "./apiClient";

const mockPurchaseRequests = [
  {
    id: "pr-001",
    requestCode: "PR-2024-0912-001",
    materialId: "mat-002",
    quantity: 120,
    reason: "Replenish cement for Q4 builds",
    status: "Pending",
    requestedBy: "A. Watson",
    createdAt: "2024-09-12T07:30:00Z",
  },
  {
    id: "pr-002",
    requestCode: "PR-2024-0911-007",
    materialId: "mat-003",
    quantity: 80,
    reason: "Critical aggregate shortfall",
    status: "Approved",
    requestedBy: "R. Singh",
    createdAt: "2024-09-11T15:05:00Z",
  },
  {
    id: "pr-003",
    requestCode: "PR-2024-0910-003",
    materialId: "mat-001",
    quantity: 30,
    reason: "Backfill steel usage spike",
    status: "Received",
    requestedBy: "L. Martinez",
    createdAt: "2024-09-10T11:20:00Z",
  },
];

const withFallback = async (requestFn, fallback) => {
  try {
    return await requestFn();
  } catch (error) {
    return fallback;
  }
};

export const procurementService = {
  async getDashboardSummary() {
    const fallback = {
      pendingRequests: mockPurchaseRequests.filter(
        (request) => request.status === "Pending"
      ).length,
    };

    return withFallback(() => procurementApi.get("/dashboard/summary"), fallback);
  },

  async getPurchaseRequests() {
    return withFallback(
      () => procurementApi.get("/purchase-requests"),
      mockPurchaseRequests
    );
  },

  async getPurchaseRequestById(id) {
    const fallback = mockPurchaseRequests.find((request) => request.id === id) ?? null;
    return withFallback(
      () => procurementApi.get(`/purchase-requests/${id}`),
      fallback
    );
  },

  async createPurchaseRequest(payload) {
    const fallback = {
      id: `pr-${Date.now()}`,
      requestCode: `PR-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: "Pending",
      requestedBy: "Ops Supervisor",
      createdAt: new Date().toISOString(),
      ...payload,
    };

    return withFallback(
      () => procurementApi.post("/purchase-requests", payload),
      fallback
    );
  },
};
