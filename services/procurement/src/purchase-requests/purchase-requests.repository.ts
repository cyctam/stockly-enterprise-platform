import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PurchaseRequestEntity } from "./purchase-request.entity";
import { PurchaseRequestStatus } from "../common/enums/purchase-request-status.enum";

export interface CreatePurchaseRequestParams {
  requestCode: string;
  materialId: string;
  materialName: string;
  quantity: number;
  reason: string;
  status: PurchaseRequestStatus;
  requestedBy: string;
  createdAt?: Date;
}

export interface UpdatePurchaseRequestParams {
  materialId?: string;
  materialName?: string;
  quantity?: number;
  reason?: string;
  status?: PurchaseRequestStatus;
  requestedBy?: string;
  updatedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  orderedAt?: Date;
  receivedAt?: Date;
  cancelledAt?: Date;
  note?: string;
}

@Injectable()
export class PurchaseRequestsRepository {
  private readonly requests: PurchaseRequestEntity[] = [];

  async findAll(): Promise<PurchaseRequestEntity[]> {
    return this.requests.map((request) => ({ ...request }));
  }

  async findById(id: string): Promise<PurchaseRequestEntity | null> {
    const request = this.requests.find((item) => item.id === id);
    return request ? { ...request } : null;
  }

  async findByRequestCode(
    requestCode: string,
  ): Promise<PurchaseRequestEntity | null> {
    const request = this.requests.find(
      (item) => item.requestCode === requestCode,
    );
    return request ? { ...request } : null;
  }

  async create(
    payload: CreatePurchaseRequestParams,
  ): Promise<PurchaseRequestEntity> {
    const now = payload.createdAt ?? new Date();
    const request: PurchaseRequestEntity = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      requestCode: payload.requestCode,
      materialId: payload.materialId,
      materialName: payload.materialName,
      quantity: payload.quantity,
      reason: payload.reason,
      status: payload.status,
      requestedBy: payload.requestedBy,
    };

    this.requests.push(request);
    return { ...request };
  }

  async update(
    id: string,
    payload: UpdatePurchaseRequestParams,
  ): Promise<PurchaseRequestEntity | null> {
    const index = this.requests.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const current = this.requests[index];
    const updated: PurchaseRequestEntity = {
      ...current,
      ...payload,
      updatedAt: payload.updatedAt ?? new Date(),
    };

    this.requests[index] = updated;

    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    const index = this.requests.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    this.requests.splice(index, 1);
    return true;
  }
}

export class InMemoryPurchaseRequestsRepository extends PurchaseRequestsRepository {}
