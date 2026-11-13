import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PurchaseRequestsRepository } from "./purchase-requests.repository";
import { CreatePurchaseRequestDto } from "./dto/create-purchase-request.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { ReceivePurchaseRequestDto } from "./dto/receive-purchase-request.dto";
import { PurchaseRequestStatus } from "../common/enums/purchase-request-status.enum";
import { generateRequestCode } from "../common/utils/request-code.util";
import { PurchaseRequestEntity } from "./purchase-request.entity";
import {
  InventoryGrpcService,
  MaterialResponse,
} from "../grpc/inventory-grpc.service";
import { PurchaseEventsService } from "../events/purchase-events.service";

export interface PurchaseRequestSummary {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  ordered: number;
  received: number;
  cancelled: number;
  updatedAt: string;
}

@Injectable()
export class PurchaseRequestsService {
  private readonly logger = new Logger("PurchaseRequestsService");

constructor(
  private readonly repository: PurchaseRequestsRepository,
  private readonly inventoryGrpcService: InventoryGrpcService,
  private readonly purchaseEventsService: PurchaseEventsService,
  private readonly configService: ConfigService,
) {}

  async create(dto: CreatePurchaseRequestDto) {
    const requireLowStock = this.isLowStockRequired();
    const { materialName, material } = await this.resolveMaterialDetails(
      dto.materialId,
      dto.materialName,
      requireLowStock,
    );

    await this.assertLowStockIfRequired(material, requireLowStock);

    const requestCode = await this.generateUniqueRequestCode();

    const created = await this.repository.create({
      requestCode,
      materialId: dto.materialId,
      materialName,
      quantity: dto.quantity,
      reason: dto.reason,
      status: PurchaseRequestStatus.Pending,
      requestedBy: dto.requestedBy,
    });

    return this.mapToResponse(created);
  }

  async findAll() {
    const requests = await this.repository.findAll();
    const sorted = [...requests].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return sorted.map((request) => this.mapToResponse(request));
  }

  async findOne(id: string) {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundException(`Purchase request ${id} not found.`);
    }
    return this.mapToResponse(request);
  }

  async getSummary(): Promise<PurchaseRequestSummary> {
    const requests = await this.repository.findAll();

    return {
      totalRequests: requests.length,
      pending: requests.filter(
        (r) => r.status === PurchaseRequestStatus.Pending,
      ).length,
      approved: requests.filter(
        (r) => r.status === PurchaseRequestStatus.Approved,
      ).length,
      rejected: requests.filter(
        (r) => r.status === PurchaseRequestStatus.Rejected,
      ).length,
      ordered: requests.filter(
        (r) => r.status === PurchaseRequestStatus.Ordered,
      ).length,
      received: requests.filter(
        (r) => r.status === PurchaseRequestStatus.Received,
      ).length,
      cancelled: requests.filter(
        (r) => r.status === PurchaseRequestStatus.Cancelled,
      ).length,
      updatedAt: new Date().toISOString(),
    };
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const request = await this.getEntity(id);
    this.assertTransitionAllowed(request.status, dto.status);

    const timestamps = this.getStatusTimestampUpdate(dto.status);

    const updated = await this.repository.update(id, {
      status: dto.status,
      note: dto.note,
      ...timestamps,
    });

    if (!updated) {
      throw new NotFoundException(`Purchase request ${id} not found.`);
    }

    return this.mapToResponse(updated);
  }

  async approve(id: string) {
    return this.updateStatus(id, { status: PurchaseRequestStatus.Approved });
  }

  async reject(id: string, note?: string) {
    return this.updateStatus(id, {
      status: PurchaseRequestStatus.Rejected,
      note,
    });
  }

  async receive(id: string, dto: ReceivePurchaseRequestDto) {
    const request = await this.getEntity(id);
    this.assertTransitionAllowed(
      request.status,
      PurchaseRequestStatus.Received,
    );

    const updated = await this.repository.update(id, {
      status: PurchaseRequestStatus.Received,
      receivedAt: new Date(),
      note: dto.note,
    });

    if (!updated) {
      throw new NotFoundException(`Purchase request ${id} not found.`);
    }

    await this.publishReceivedEvent(updated);

    return this.mapToResponse(updated);
  }

  private async getEntity(id: string): Promise<PurchaseRequestEntity> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundException(`Purchase request ${id} not found.`);
    }
    return request;
  }

  private async resolveMaterialDetails(
    materialId: string,
    providedName?: string,
    forceLookup = false,
  ): Promise<{ materialName: string; material?: MaterialResponse }> {
    const hasProvidedName = !!providedName && providedName.trim().length > 0;

    if (hasProvidedName && !forceLookup) {
      return { materialName: providedName!.trim() };
    }

    try {
      const material =
        await this.inventoryGrpcService.getMaterialById(materialId);
      return {
        materialName: hasProvidedName ? providedName!.trim() : material.name,
        material,
      };
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          msg: "material_name_resolution_failed",
          materialId,
          error: (error as Error)?.message,
        }),
      );

      if (hasProvidedName) {
        return { materialName: providedName!.trim() };
      }

      throw new BadRequestException(
        "materialName is required when material lookup fails.",
      );
    }
  }

  private async assertLowStockIfRequired(
    material?: MaterialResponse,
    requireLowStock = this.isLowStockRequired(),
  ) {
    if (!requireLowStock) {
      return;
    }

    if (!material) {
      throw new BadRequestException(
        "Low-stock validation requires inventory material details.",
      );
    }

    if (material.currentStock > material.minStock) {
      throw new BadRequestException(
        "Purchase requests can only be created for low-stock materials.",
      );
    }
  }

  private isLowStockRequired() {
    return (
      this.configService.get<string>("REQUIRE_LOW_STOCK_REQUEST") === "true"
    );
  }

  private async generateUniqueRequestCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateRequestCode();
      const exists = await this.repository.findByRequestCode(code);
      if (!exists) {
        return code;
      }
    }

    throw new BadRequestException(
      "Unable to generate unique request code. Try again.",
    );
  }

  private assertTransitionAllowed(
    current: PurchaseRequestStatus,
    next: PurchaseRequestStatus,
  ) {
    if (current === next) {
      return;
    }

    const allowedNext: Record<PurchaseRequestStatus, PurchaseRequestStatus[]> =
      {
        [PurchaseRequestStatus.Pending]: [
          PurchaseRequestStatus.Approved,
          PurchaseRequestStatus.Rejected,
          PurchaseRequestStatus.Cancelled,
        ],
        [PurchaseRequestStatus.Approved]: [
          PurchaseRequestStatus.Ordered,
          PurchaseRequestStatus.Received,
          PurchaseRequestStatus.Cancelled,
        ],
        [PurchaseRequestStatus.Rejected]: [],
        [PurchaseRequestStatus.Ordered]: [
          PurchaseRequestStatus.Received,
          PurchaseRequestStatus.Cancelled,
        ],
        [PurchaseRequestStatus.Received]: [],
        [PurchaseRequestStatus.Cancelled]: [],
      };

    const nextStatuses = allowedNext[current] ?? [];

    if (!nextStatuses.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from ${current} to ${next}.`,
      );
    }
  }

  private getStatusTimestampUpdate(status: PurchaseRequestStatus) {
    const now = new Date();
    switch (status) {
      case PurchaseRequestStatus.Approved:
        return { approvedAt: now };
      case PurchaseRequestStatus.Rejected:
        return { rejectedAt: now };
      case PurchaseRequestStatus.Ordered:
        return { orderedAt: now };
      case PurchaseRequestStatus.Received:
        return { receivedAt: now };
      case PurchaseRequestStatus.Cancelled:
        return { cancelledAt: now };
      default:
        return {};
    }
  }

  private async publishReceivedEvent(request: PurchaseRequestEntity) {
    const payload = {
      requestId: request.id,
      requestCode: request.requestCode,
      materialId: request.materialId,
      materialName: request.materialName,
      quantity: request.quantity,
      receivedAt: request.receivedAt?.toISOString() || new Date().toISOString(),
      source: "procurement-service",
      note: request.note,
    };

    await this.purchaseEventsService.publishPurchaseReceived(payload);
  }

  private mapToResponse(request: PurchaseRequestEntity) {
    return {
      id: request.id,
      requestCode: request.requestCode,
      materialId: request.materialId,
      materialName: request.materialName,
      quantity: request.quantity,
      reason: request.reason,
      status: request.status,
      requestedBy: request.requestedBy,
      note: request.note,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      approvedAt: request.approvedAt?.toISOString(),
      rejectedAt: request.rejectedAt?.toISOString(),
      orderedAt: request.orderedAt?.toISOString(),
      receivedAt: request.receivedAt?.toISOString(),
      cancelledAt: request.cancelledAt?.toISOString(),
    };
  }
}
