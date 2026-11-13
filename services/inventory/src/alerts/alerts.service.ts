import { Injectable } from "@nestjs/common";
import { AlertSeverity } from "../common/enums/alert-severity.enum";
import { getAlertSeverity } from "../common/utils/alert-severity.util";
import { isLowStock } from "../common/utils/stock-status.util";
import { AlertsRepository } from "./alerts.repository";

export interface StockAlertRecord {
  id: string;
  materialId: string;
  currentStock: number;
  minStock: number;
  severity: AlertSeverity;
  createdAt: string;
}

export interface UpsertAlertInput {
  materialId: string;
  currentStock: number;
  minStock: number;
}

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  async findAll(): Promise<StockAlertRecord[]> {
    const alerts = await this.alertsRepository.findAll();
    return alerts.map((alert) => ({
      id: alert.id,
      materialId: alert.materialId,
      currentStock: alert.currentStock,
      minStock: alert.minStock,
      severity: alert.severity,
      createdAt: alert.createdAt.toISOString(),
    }));
  }

  async findLowStock(): Promise<StockAlertRecord[]> {
    const alerts = await this.alertsRepository.findAll();
    return alerts
      .filter((alert) => isLowStock(alert.currentStock, alert.minStock))
      .map((alert) => ({
        id: alert.id,
        materialId: alert.materialId,
        currentStock: alert.currentStock,
        minStock: alert.minStock,
        severity: alert.severity,
        createdAt: alert.createdAt.toISOString(),
      }));
  }

  async upsert(input: UpsertAlertInput): Promise<StockAlertRecord | null> {
    if (!isLowStock(input.currentStock, input.minStock)) {
      await this.removeByMaterialId(input.materialId);
      return null;
    }

    const updated = await this.alertsRepository.upsertLowStock({
      materialId: input.materialId,
      currentStock: input.currentStock,
      minStock: input.minStock,
      severity: getAlertSeverity(input.currentStock, input.minStock),
    });

    return {
      id: updated.id,
      materialId: updated.materialId,
      currentStock: updated.currentStock,
      minStock: updated.minStock,
      severity: updated.severity,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async removeByMaterialId(materialId: string): Promise<void> {
    await this.alertsRepository.deleteByMaterialId(materialId);
  }
}
