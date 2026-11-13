import { inventoryApi } from "./apiClient";

const mockMaterials = [
  {
    id: "mat-001",
    name: "Reinforced Steel Rods",
    category: "Metals",
    unit: "tons",
    currentStock: 48,
    minStock: 30,
    status: "Healthy",
    updatedAt: "2024-09-12T08:45:00Z",
  },
  {
    id: "mat-002",
    name: "Portland Cement",
    category: "Cement",
    unit: "bags",
    currentStock: 120,
    minStock: 150,
    status: "Low Stock",
    updatedAt: "2024-09-12T07:20:00Z",
  },
  {
    id: "mat-003",
    name: "Construction Aggregate",
    category: "Aggregates",
    unit: "tons",
    currentStock: 18,
    minStock: 40,
    status: "Critical",
    updatedAt: "2024-09-12T06:50:00Z",
  },
  {
    id: "mat-004",
    name: "Industrial Fasteners",
    category: "Hardware",
    unit: "boxes",
    currentStock: 210,
    minStock: 120,
    status: "Healthy",
    updatedAt: "2024-09-11T16:30:00Z",
  },
];

const mockStockMovements = [
  {
    id: "mov-201",
    materialId: "mat-001",
    type: "inflow",
    quantity: 12,
    source: "Kodo Metals",
    note: "Rush order received",
    timestamp: "2024-09-12T08:10:00Z",
  },
  {
    id: "mov-202",
    materialId: "mat-001",
    type: "outflow",
    quantity: 6,
    source: "Assembly Line B",
    note: "Daily production usage",
    timestamp: "2024-09-11T14:40:00Z",
  },
  {
    id: "mov-203",
    materialId: "mat-002",
    type: "inflow",
    quantity: 60,
    source: "CementWorks Ltd",
    note: "Scheduled delivery",
    timestamp: "2024-09-11T10:15:00Z",
  },
];

const mockAlerts = [
  {
    id: "alert-001",
    materialId: "mat-002",
    currentStock: 120,
    minStock: 150,
    severity: "Low Stock",
    createdAt: "2024-09-12T06:15:00Z",
  },
  {
    id: "alert-002",
    materialId: "mat-003",
    currentStock: 18,
    minStock: 40,
    severity: "Critical",
    createdAt: "2024-09-12T05:50:00Z",
  },
];

const mockInflowLog = [
  {
    id: "inflow-001",
    materialId: "mat-001",
    type: "inflow",
    quantity: 12,
    source: "Kodo Metals",
    note: "Rush order received",
    timestamp: "2024-09-12T08:10:00Z",
  },
  {
    id: "inflow-002",
    materialId: "mat-002",
    type: "inflow",
    quantity: 60,
    source: "CementWorks Ltd",
    note: "Scheduled delivery",
    timestamp: "2024-09-11T10:15:00Z",
  },
];

const withFallback = async (requestFn, fallback) => {
  try {
    return await requestFn();
  } catch (error) {
    return fallback;
  }
};

export const inventoryService = {
  async getDashboardSummary() {
    try {
      const materials = await inventoryApi.get("/materials");
      
      const totalMaterials = materials.length;
      const lowStockItems = materials.filter((item) => {
        return item.status === "Low Stock" || item.status === "Critical" || item.currentStock <= item.minStock;
      }).length;

      return {
        totalMaterials,
        lowStockItems,
        todaysInflow: 5,
      };
    } catch (error) {
      return {
        totalMaterials: mockMaterials.length,
        lowStockItems: mockMaterials.filter((item) => item.status !== "Healthy").length,
        todaysInflow: mockInflowLog.length,
      };
    }
  },

  async getMaterials() {
    return withFallback(() => inventoryApi.get("/materials"), mockMaterials);
  },

  async getMaterialById(id) {
    const fallback = mockMaterials.find((item) => item.id === id) ?? null;
    return withFallback(() => inventoryApi.get(`/materials/${id}`), fallback);
  },

  async getStockMovements(materialId) {
    const fallback = mockStockMovements.filter(
      (movement) => movement.materialId === materialId
    );

    return withFallback(
      () => inventoryApi.get(`/materials/${materialId}/movements`),
      fallback
    );
  },

  async getStockInflowLog() {
    return mockInflowLog;
  },

  async getAlerts() {
    return withFallback(() => inventoryApi.get("/alerts"), mockAlerts);
  },
};