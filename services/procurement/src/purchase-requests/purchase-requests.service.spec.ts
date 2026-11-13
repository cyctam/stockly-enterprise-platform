import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PurchaseRequestsService } from "./purchase-requests.service";
import { PurchaseRequestsRepository } from "./purchase-requests.repository";
import { PurchaseRequestStatus } from "../common/enums/purchase-request-status.enum";
import { InventoryGrpcService } from "../grpc/inventory-grpc.service";
import { PurchaseEventsService } from "../events/purchase-events.service";

describe("PurchaseRequestsService", () => {
  let service: PurchaseRequestsService;
  let repository: PurchaseRequestsRepository;
  let inventoryGrpcService: InventoryGrpcService;
  let purchaseEventsService: PurchaseEventsService;
  let configService: ConfigService;

  beforeEach(() => {
    repository = new PurchaseRequestsRepository();

    inventoryGrpcService = {
      getMaterialById: jest.fn(),
      getMaterialByName: jest.fn(),
    } as unknown as InventoryGrpcService;

    purchaseEventsService = {
      publishPurchaseReceived: jest.fn().mockResolvedValue({ published: true }),
    } as unknown as PurchaseEventsService;

    configService = {
      get: jest.fn().mockReturnValue("false"),
    } as unknown as ConfigService;

    service = new PurchaseRequestsService(
      repository,
      inventoryGrpcService,
      purchaseEventsService,
      configService,
    );
  });

  it("creates a purchase request using provided material name", async () => {
    const created = await service.create({
      materialId: "mat-1",
      materialName: "Steel Sheet",
      quantity: 20,
      reason: "Low stock",
      requestedBy: "Amiya",
    });

    expect(created.id).toBeDefined();
    expect(created.requestCode).toMatch(/^PR-\d{8}-\d{4}$/);
    expect(created.materialId).toBe("mat-1");
    expect(created.materialName).toBe("Steel Sheet");
    expect(created.quantity).toBe(20);
    expect(created.status).toBe(PurchaseRequestStatus.Pending);
  });

  it("creates a purchase request and resolves material name via gRPC when missing", async () => {
    (inventoryGrpcService.getMaterialById as jest.Mock).mockResolvedValue({
      id: "mat-2",
      name: "Copper Wire",
      category: "Metals",
      unit: "roll",
      currentStock: 3,
      minStock: 10,
      status: "LOW",
      updatedAt: new Date().toISOString(),
    });

    const created = await service.create({
      materialId: "mat-2",
      quantity: 5,
      reason: "Replenish",
      requestedBy: "Kal'tsit",
    });

    expect(inventoryGrpcService.getMaterialById).toHaveBeenCalledWith("mat-2");
    expect(created.materialName).toBe("Copper Wire");
  });

  it("fails creation when material name is missing and gRPC lookup fails", async () => {
    (inventoryGrpcService.getMaterialById as jest.Mock).mockRejectedValue(
      new Error("Not found"),
    );

    await expect(
      service.create({
        materialId: "mat-3",
        quantity: 4,
        reason: "Low stock",
        requestedBy: "Ch'en",
      }),
    ).rejects.toThrow("materialName is required when material lookup fails.");
  });

  it("allows status transitions in order: Pending -> Approved -> Ordered -> Received", async () => {
    const created = await service.create({
      materialId: "mat-4",
      materialName: "Cement",
      quantity: 12,
      reason: "Project Alpha",
      requestedBy: "Texas",
    });

    const approved = await service.approve(created.id);
    expect(approved.status).toBe(PurchaseRequestStatus.Approved);

    const ordered = await service.updateStatus(approved.id, {
      status: PurchaseRequestStatus.Ordered,
    });
    expect(ordered.status).toBe(PurchaseRequestStatus.Ordered);

    const received = await service.receive(ordered.id, {
      receivedBy: "Exusiai",
      note: "Delivered",
    });
    expect(received.status).toBe(PurchaseRequestStatus.Received);
  });

  it("prevents invalid status transition", async () => {
    const created = await service.create({
      materialId: "mat-5",
      materialName: "Polymer",
      quantity: 8,
      reason: "Low stock",
      requestedBy: "Hoshiguma",
    });

    await expect(
      service.updateStatus(created.id, {
        status: PurchaseRequestStatus.Received,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("publishes purchase received event when request is received", async () => {
    const created = await service.create({
      materialId: "mat-6",
      materialName: "Silicon",
      quantity: 2,
      reason: "Prototype",
      requestedBy: "Closure",
    });

    const approved = await service.approve(created.id);
    const received = await service.receive(approved.id, {
      note: "Dock A",
    });

    expect(received.status).toBe(PurchaseRequestStatus.Received);
    expect(purchaseEventsService.publishPurchaseReceived).toHaveBeenCalled();
    const payload = (purchaseEventsService.publishPurchaseReceived as jest.Mock)
      .mock.calls[0][0];
    expect(payload.requestId).toBe(received.id);
    expect(payload.materialId).toBe("mat-6");
    expect(payload.quantity).toBe(2);
  });

  it("returns summary counts", async () => {
    await service.create({
      materialId: "mat-7",
      materialName: "Alloy",
      quantity: 10,
      reason: "Low stock",
      requestedBy: "Frostleaf",
    });

    await service.create({
      materialId: "mat-8",
      materialName: "Graphite",
      quantity: 6,
      reason: "Replenish",
      requestedBy: "Meteorite",
    });

    const all = await service.findAll();
    await service.approve(all[0].id);

    const summary = await service.getSummary();
    expect(summary.totalRequests).toBe(2);
    expect(summary.pending).toBe(1);
    expect(summary.approved).toBe(1);
  });
});
