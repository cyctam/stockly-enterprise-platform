import { PurchaseRequestStatus } from "../common/enums/purchase-request-status.enum";

export interface PurchaseRequestEntity {
  id: string;
  requestCode: string;
  materialId: string;
  materialName: string;
  quantity: number;
  reason: string;
  status: PurchaseRequestStatus;
  requestedBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  orderedAt?: Date;
  receivedAt?: Date;
  cancelledAt?: Date;
  note?: string;
}
